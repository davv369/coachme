import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthorizeStravaCommand,
  HandleStravaCallbackCommand,
  SyncStravaActivitiesCommand,
  SyncStravaActivityCommand,
  DisconnectStravaCommand,
  CheckStravaConnectionQuery,
  StravaInPort,
} from '../ports/in/strava.in-port';
import {
  STRAVA_TOKEN_REPOSITORY_OUT_PORT,
  StravaTokenRepositoryOutPort,
} from '../ports/out/strava-token-repository.out-port';
import {
  STRAVA_API_OUT_PORT,
  StravaApiOutPort,
} from '../ports/out/strava-api.out-port';
import { StravaToken } from '../../domain/strava-token.entity';
import { StravaActivity } from '../../domain/strava-activity.entity';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import { Logger } from '@common/logger/logger';
import { StravaActivityMapperService } from './strava-activity-mapper.service';
import {
  TRAINING_SESSION_IN_PORT,
  TrainingSessionInPort,
} from '@modules/training-sessions/application/ports/in/training-session.in-port';

@Injectable()
export class StravaService implements StravaInPort {
  private readonly logger = new Logger(StravaService.name);
  private readonly clientId: string;
  private readonly redirectUri: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(STRAVA_TOKEN_REPOSITORY_OUT_PORT)
    private readonly stravaTokenRepository: StravaTokenRepositoryOutPort,
    @Inject(STRAVA_API_OUT_PORT)
    private readonly stravaApi: StravaApiOutPort,
    private readonly activityMapper: StravaActivityMapperService,
    @Inject(TRAINING_SESSION_IN_PORT)
    private readonly trainingSessionInPort: TrainingSessionInPort,
  ) {
    this.clientId = configService.get<string>('STRAVA_CLIENT_ID') || '';
    this.redirectUri =
      configService.get<string>('STRAVA_REDIRECT_URI') ||
      'http://localhost:3000/api/strava/callback';
  }

  async authorizeStrava(command: AuthorizeStravaCommand): Promise<string> {
    const scopes = 'read,activity:read';
    const state = command.userId; // Use userId as state for security

    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=${scopes}&state=${state}`;

    return authUrl;
  }

  async checkConnection(
    query: CheckStravaConnectionQuery,
  ): Promise<StravaToken | null> {
    return this.stravaTokenRepository.findByUserId({
      userId: query.userId,
    });
  }

  async handleCallback(
    command: HandleStravaCallbackCommand,
  ): Promise<StravaToken> {
    // Exchange code for token
    const tokenResponse = await this.stravaApi.exchangeCodeForToken({
      code: command.code,
    });

    // Check if token already exists for this user
    const existingToken = await this.stravaTokenRepository.findByUserId({
      userId: command.userId,
    });

    const expiresAt = new Date(tokenResponse.expires_at * 1000);

    if (existingToken) {
      // Update existing token
      return this.stravaTokenRepository.update({
        id: existingToken.id,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt,
      });
    } else {
      // Create new token
      return this.stravaTokenRepository.create({
        userId: command.userId,
        stravaAthleteId: tokenResponse.athlete.id.toString(),
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt,
      });
    }
  }

  async syncActivities(command: SyncStravaActivitiesCommand): Promise<number> {
    const token = await this.stravaTokenRepository.findByUserId({
      userId: command.userId,
    });

    if (!token) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Strava account not connected',
      );
    }

    // Check if token needs refresh
    const validToken = await this.ensureValidToken(token);

    // Get activities from Strava
    const activities = await this.stravaApi.getActivities({
      accessToken: validToken.accessToken,
      after: command.after
        ? Math.floor(command.after.getTime() / 1000)
        : undefined,
      before: command.before
        ? Math.floor(command.before.getTime() / 1000)
        : undefined,
      perPage: 200, // Max per page
    });

    // Sync each activity
    let syncedCount = 0;
    for (const activity of activities) {
      try {
        await this.createTrainingSessionFromActivity(command.userId, activity);
        syncedCount++;
      } catch (error) {
        // Log error but continue with other activities
        this.logger.error(`Failed to sync activity ${activity.id}:`, error);
      }
    }

    return syncedCount;
  }

  async syncActivity(command: SyncStravaActivityCommand): Promise<void> {
    const token = await this.stravaTokenRepository.findByUserId({
      userId: command.userId,
    });

    if (!token) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Strava account not connected',
      );
    }

    const validToken = await this.ensureValidToken(token);

    const activity = await this.stravaApi.getActivity({
      accessToken: validToken.accessToken,
      activityId: command.activityId,
    });

    await this.createTrainingSessionFromActivity(command.userId, activity);
  }

  async syncActivityByStravaAthleteId(
    stravaAthleteId: string,
    activityId: string,
  ): Promise<void> {
    const token = await this.stravaTokenRepository.findByStravaAthleteId({
      stravaAthleteId,
    });

    if (!token) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Strava account not connected',
      );
    }

    const validToken = await this.ensureValidToken(token);

    const activity = await this.stravaApi.getActivity({
      accessToken: validToken.accessToken,
      activityId,
    });

    await this.createTrainingSessionFromActivity(token.userId, activity);
  }

  async disconnectStrava(command: DisconnectStravaCommand): Promise<void> {
    await this.stravaTokenRepository.delete({
      userId: command.userId,
    });
  }

  private async ensureValidToken(token: StravaToken): Promise<StravaToken> {
    // Check if token is expired (with 5 minute buffer)
    const now = new Date();
    const expiresAt = new Date(token.expiresAt);
    expiresAt.setMinutes(expiresAt.getMinutes() - 5);

    if (now >= expiresAt) {
      // Token expired, refresh it
      const tokenResponse = await this.stravaApi.refreshToken({
        refreshToken: token.refreshToken,
      });

      const newExpiresAt = new Date(tokenResponse.expires_at * 1000);

      return this.stravaTokenRepository.update({
        id: token.id,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: newExpiresAt,
      });
    }

    return token;
  }

  private async createTrainingSessionFromActivity(
    userId: string,
    activity: StravaActivity,
  ): Promise<void> {
    const existingSession =
      await this.trainingSessionInPort.findTrainingSessionByStravaActivityId({
        athleteId: userId,
        stravaActivityId: activity.id,
      });

    if (existingSession) {
      this.logger.log(
        `Training session already exists for Strava activity ${activity.id}`,
      );
      return;
    }

    const workoutType = this.activityMapper.mapStravaTypeToWorkoutType(
      activity.type,
    );
    const parameters = this.activityMapper.mapActivityToParameters(activity);

    await this.trainingSessionInPort.createTrainingSession({
      athleteId: userId,
      workoutType,
      actualDate: activity.startDate,
      actualParameters: parameters,
      notes: activity.description || `Synced from Strava: ${activity.name}`,
      trainingPlanId: null,
      stravaActivityId: activity.id,
    });
  }

  async updateActivityByStravaAthleteId(
    stravaAthleteId: string,
    activityId: string,
  ): Promise<void> {
    const token = await this.stravaTokenRepository.findByStravaAthleteId({
      stravaAthleteId,
    });

    if (!token) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Strava account not connected',
      );
    }

    const validToken = await this.ensureValidToken(token);

    const existingSession =
      await this.trainingSessionInPort.findTrainingSessionByStravaActivityId({
        athleteId: token.userId,
        stravaActivityId: activityId,
      });

    if (!existingSession) {
      this.logger.log(
        `Training session not found for Strava activity ${activityId}, creating new one`,
      );
      await this.syncActivityByStravaAthleteId(stravaAthleteId, activityId);
      return;
    }

    const activity = await this.stravaApi.getActivity({
      accessToken: validToken.accessToken,
      activityId,
    });

    const workoutType = this.activityMapper.mapStravaTypeToWorkoutType(
      activity.type,
    );
    const parameters = this.activityMapper.mapActivityToParameters(activity);

    await this.trainingSessionInPort.updateTrainingSession({
      id: existingSession.id,
      athleteId: token.userId,
      workoutType,
      actualDate: activity.startDate,
      actualParameters: parameters,
      notes: activity.description || `Synced from Strava: ${activity.name}`,
    });

    this.logger.log(
      `✅ Successfully updated training session for Strava activity ${activityId}`,
    );
  }

  async deleteActivityByStravaAthleteId(
    stravaAthleteId: string,
    activityId: string,
  ): Promise<void> {
    const token = await this.stravaTokenRepository.findByStravaAthleteId({
      stravaAthleteId,
    });

    if (!token) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Strava account not connected',
      );
    }

    const existingSession =
      await this.trainingSessionInPort.findTrainingSessionByStravaActivityId({
        athleteId: token.userId,
        stravaActivityId: activityId,
      });

    if (!existingSession) {
      this.logger.log(
        `Training session not found for Strava activity ${activityId}, nothing to delete`,
      );
      return;
    }

    await this.trainingSessionInPort.deleteTrainingSession({
      id: existingSession.id,
      athleteId: token.userId,
    });

    this.logger.log(
      `✅ Successfully deleted training session for Strava activity ${activityId}`,
    );
  }
}
