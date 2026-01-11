import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  Res,
  Inject,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { Logger } from '@common/logger/logger';
import {
  Authenticated,
  CurrentUser,
} from '@modules/auth/application/decorators';
import { JwtPayload } from '@modules/auth/domain/jwt-payload';
import { UserRole } from '@modules/auth/domain/user-role';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import {
  STRAVA_OUT_PORT,
  StravaOutPort,
} from '../../../../../application/ports/out/strava.out-port';
import { SyncActivitiesDto } from '@common/dto/strava/sync-activities.dto';

@ApiTags('Strava')
@Controller('strava')
export class StravaHttpInAdapter {
  private readonly logger = new Logger(StravaHttpInAdapter.name);

  constructor(
    @Inject(STRAVA_OUT_PORT)
    private readonly stravaOutPort: StravaOutPort,
  ) {}

  @Get('status')
  @Authenticated()
  @ApiOperation({ summary: 'Check Strava connection status' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async getStatus(@CurrentUser() jwtPayload: JwtPayload): Promise<{
    connected: boolean;
    stravaAthleteId?: string;
  }> {
    const token = await this.stravaOutPort.checkConnection({
      userId: jwtPayload.sub,
    });

    return {
      connected: !!token,
      stravaAthleteId: token?.stravaAthleteId,
    };
  }

  @Get('authorize')
  @Authenticated()
  @ApiOperation({ summary: 'Get Strava authorization URL' })
  @ApiResponse({ status: 302, description: 'Redirects to Strava' })
  @ApiResponse({
    status: 200,
    description: 'Returns authorization URL as JSON',
  })
  async authorize(
    @CurrentUser() jwtPayload: JwtPayload,
    @Res() res: Response,
    @Query('format') format?: string,
  ): Promise<void> {
    this.logger.log(`User ${jwtPayload.email} requesting Strava authorization`);

    if (jwtPayload.role !== UserRole.ATHLETE) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only athletes can connect Strava account',
      );
    }

    const authUrl = await this.stravaOutPort.authorizeStrava({
      userId: jwtPayload.sub,
    });

    // If format=json, return JSON instead of redirecting
    if (format === 'json') {
      res.status(200).json({ authUrl });
      return;
    }

    // Otherwise redirect (default behavior)
    res.redirect(authUrl);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Strava OAuth callback or webhook verification' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to success or error page (OAuth)',
  })
  @ApiResponse({ status: 200, description: 'Webhook verification response' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.mode') mode: string,
    @Res() res: Response,
  ): Promise<void> {
    // Check if this is a webhook verification request
    // Webhook verification has hub.verify_token, hub.challenge, and hub.mode
    if (
      verifyToken !== undefined ||
      challenge !== undefined ||
      mode !== undefined
    ) {
      // If any webhook param is present, treat as webhook verification
      if (!verifyToken || !challenge || !mode) {
        throw new DomainException(
          InternalErrorCode.VALIDATION_ERROR,
          'Missing webhook verification parameters',
        );
      }

      const expectedToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'STRAVA';

      if (mode === 'subscribe' && verifyToken === expectedToken) {
        this.logger.log('Strava webhook verified');
        res.json({ 'hub.challenge': challenge });
        return;
      }

      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Invalid webhook verification',
      );
    }

    // Otherwise, treat as OAuth callback
    if (error) {
      this.logger.error(`Strava authorization error: ${error}`);
      res.redirect(`/api/strava/error?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code || !state) {
      this.logger.warn('OAuth callback missing code or state parameter');
      res.redirect('/api/strava/error?error=missing_code_or_state');
      return;
    }

    try {
      // state contains userId
      await this.stravaOutPort.handleCallback({
        userId: state,
        code,
      });

      this.logger.log(`Strava account connected for user: ${state}`);
      res.redirect('/api/strava/success');
    } catch (error: any) {
      this.logger.error(`Failed to handle Strava callback: ${error.message}`);
      res.redirect(
        `/api/strava/error?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @Get('success')
  @ApiOperation({ summary: 'Strava connection success page' })
  @ApiResponse({
    status: 200,
    description: 'Success page',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  })
  async success(): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Strava account connected successfully',
    };
  }

  @Get('error')
  @ApiOperation({ summary: 'Strava connection error page' })
  @ApiResponse({
    status: 200,
    description: 'Error page',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
  })
  async error(
    @Query('error') error: string,
  ): Promise<{ success: boolean; error: string }> {
    return {
      success: false,
      error: error || 'Unknown error occurred',
    };
  }

  @Post('sync')
  @Authenticated()
  @ApiOperation({ summary: 'Manually sync Strava activities' })
  @ApiResponse({ status: 200, description: 'Activities synced successfully' })
  async syncActivities(
    @Body() dto: SyncActivitiesDto,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<{ synced: number }> {
    this.logger.log(`User ${jwtPayload.email} syncing Strava activities`);

    if (jwtPayload.role !== UserRole.ATHLETE) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only athletes can sync Strava activities',
      );
    }

    const synced = await this.stravaOutPort.syncActivities({
      userId: jwtPayload.sub,
      after: dto.after ? new Date(dto.after) : undefined,
      before: dto.before ? new Date(dto.before) : undefined,
    });

    return { synced };
  }

  @Post('sync/:activityId')
  @Authenticated()
  @ApiOperation({ summary: 'Sync specific Strava activity' })
  @ApiResponse({ status: 200, description: 'Activity synced successfully' })
  async syncActivity(
    @Param('activityId') activityId: string,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<void> {
    this.logger.log(
      `User ${jwtPayload.email} syncing Strava activity: ${activityId}`,
    );

    if (jwtPayload.role !== UserRole.ATHLETE) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only athletes can sync Strava activities',
      );
    }

    await this.stravaOutPort.syncActivity({
      userId: jwtPayload.sub,
      activityId,
    });
  }

  @Post('disconnect')
  @Authenticated()
  @ApiOperation({ summary: 'Disconnect Strava account' })
  @ApiResponse({ status: 200, description: 'Strava account disconnected' })
  async disconnect(@CurrentUser() jwtPayload: JwtPayload): Promise<void> {
    this.logger.log(`User ${jwtPayload.email} disconnecting Strava account`);

    if (jwtPayload.role !== UserRole.ATHLETE) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only athletes can disconnect Strava account',
      );
    }

    await this.stravaOutPort.disconnectStrava({
      userId: jwtPayload.sub,
    });
  }

  @Post('callback')
  @ApiOperation({ summary: 'Strava webhook handler' })
  @ApiResponse({ status: 200 })
  async handleWebhook(
    @Body() body: any,
    @Headers('x-strava-signature') signature: string,
    @Res() res: Response,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const subscriptionId = body.subscription_id;
    const eventTime = body.event_time
      ? new Date(body.event_time * 1000).toISOString()
      : 'unknown';

    this.logger.log(
      `📥 Strava webhook received [${timestamp}] (subscription_id: ${subscriptionId}, event_time: ${eventTime}): ${JSON.stringify(body)}`,
    );

    // TODO: Verify webhook signature
    // For now, we'll trust the webhook (in production, verify signature)

    if (body.object_type === 'activity') {
      const activityId = body.object_id;
      const ownerId = body.owner_id;

      if (body.aspect_type === 'create') {
        this.logger.log(
          `🏃 Strava webhook: New activity ${activityId} for athlete ${ownerId} (subscription_id: ${subscriptionId}, event_time: ${eventTime})`,
        );

        try {
          await this.stravaOutPort.syncActivityByStravaAthleteId(
            ownerId.toString(),
            activityId.toString(),
          );
          this.logger.log(
            `✅ Successfully synced activity ${activityId} for athlete ${ownerId}`,
          );
        } catch (error: any) {
          this.logger.error(
            `❌ Failed to sync activity ${activityId} for athlete ${ownerId}: ${error.message}`,
          );
          this.logger.error(`Error stack: ${error.stack}`);
        }
      } else if (body.aspect_type === 'update') {
        this.logger.log(
          `🔄 Strava webhook: Update activity ${activityId} for athlete ${ownerId} (subscription_id: ${subscriptionId}, event_time: ${eventTime}, updates: ${JSON.stringify(body.updates)})`,
        );

        try {
          await this.stravaOutPort.updateActivityByStravaAthleteId(
            ownerId.toString(),
            activityId.toString(),
          );
          this.logger.log(
            `✅ Successfully updated activity ${activityId} for athlete ${ownerId}`,
          );
        } catch (error: any) {
          this.logger.error(
            `❌ Failed to update activity ${activityId} for athlete ${ownerId}: ${error.message}`,
          );
          this.logger.error(`Error stack: ${error.stack}`);
        }
      } else if (body.aspect_type === 'delete') {
        this.logger.log(
          `🗑️  Strava webhook: Delete activity ${activityId} for athlete ${ownerId} (subscription_id: ${subscriptionId}, event_time: ${eventTime})`,
        );

        try {
          await this.stravaOutPort.deleteActivityByStravaAthleteId(
            ownerId.toString(),
            activityId.toString(),
          );
          this.logger.log(
            `✅ Successfully deleted activity ${activityId} for athlete ${ownerId}`,
          );
        } catch (error: any) {
          this.logger.error(
            `❌ Failed to delete activity ${activityId} for athlete ${ownerId}: ${error.message}`,
          );
          this.logger.error(`Error stack: ${error.stack}`);
        }
      } else {
        this.logger.log(
          `ℹ️  Strava webhook: Unsupported aspect_type ${body.aspect_type} for activity ${activityId}`,
        );
      }
    } else {
      this.logger.log(
        `ℹ️  Strava webhook: Ignoring event (object_type: ${body.object_type}, aspect_type: ${body.aspect_type})`,
      );
    }

    // Always return 200 OK to prevent Strava from retrying
    res.status(200).json({ received: true });
  }
}
