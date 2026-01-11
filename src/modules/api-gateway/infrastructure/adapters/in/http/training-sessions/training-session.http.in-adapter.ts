import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Logger } from '@common/logger/logger';
import {
  Authenticated,
  CurrentUser,
} from '@modules/auth/application/decorators';
import { JwtPayload } from '@modules/auth/domain/jwt-payload';
import { UserRole } from '@modules/auth/domain/user-role';
import { CreateTrainingSessionDto } from '@common/dto/training-sessions/create-training-session.dto';
import { TrainingSessionResponseDto } from '@common/dto/training-sessions/training-session-response.dto';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import {
  TRAINING_SESSION_OUT_PORT,
  TrainingSessionOutPort,
} from '../../../../../application/ports/out/training-session.out-port';
import {
  TRAINER_ATHLETE_OUT_PORT,
  TrainerAthleteOutPort,
} from '../../../../../application/ports/out/trainer-athlete.out-port';

@ApiTags('Training Sessions')
@Controller('training-sessions')
export class TrainingSessionHttpInAdapter {
  private readonly logger = new Logger(TrainingSessionHttpInAdapter.name);

  constructor(
    @Inject(TRAINING_SESSION_OUT_PORT)
    private readonly trainingSessionOutPort: TrainingSessionOutPort,
    @Inject(TRAINER_ATHLETE_OUT_PORT)
    private readonly trainerAthleteOutPort: TrainerAthleteOutPort,
  ) {}

  @Post()
  @Authenticated()
  @ApiOperation({ summary: 'Create new training session' })
  @ApiResponse({ status: 201, type: TrainingSessionResponseDto })
  async createTrainingSession(
    @Body() dto: CreateTrainingSessionDto,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<TrainingSessionResponseDto> {
    this.logger.log(
      `User ${jwtPayload.email} creating training session: ${dto.workoutType}`,
    );

    if (jwtPayload.role !== UserRole.ATHLETE) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only athletes can create training sessions',
      );
    }

    const session = await this.trainingSessionOutPort.createTrainingSession({
      athleteId: jwtPayload.sub,
      workoutType: dto.workoutType,
      actualDate: dto.actualDate ? new Date(dto.actualDate) : new Date(),
      actualParameters: dto.actualParameters,
      notes: dto.notes ?? null,
      trainingPlanId: dto.trainingPlanId ?? null,
    });

    return this.mapSessionToDto(session);
  }

  @Get()
  @Authenticated()
  @ApiOperation({ summary: 'Get list of training sessions' })
  @ApiResponse({ status: 200, type: [TrainingSessionResponseDto] })
  async getTrainingSessions(
    @Query('athleteId') athleteId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('trainingPlanId') trainingPlanId?: string,
    @CurrentUser() jwtPayload?: JwtPayload,
  ): Promise<TrainingSessionResponseDto[]> {
    if (!jwtPayload) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Authentication required',
      );
    }

    // Athletes can only see their own sessions
    if (jwtPayload.role === UserRole.ATHLETE) {
      const sessions =
        await this.trainingSessionOutPort.findTrainingSessionsByAthlete({
          athleteId: jwtPayload.sub,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          trainingPlanId:
            trainingPlanId === 'null' ? null : trainingPlanId || undefined,
        });
      return sessions.map((session) => this.mapSessionToDto(session));
    }

    // Trainers can only see sessions of their athletes
    if (jwtPayload.role === UserRole.TRAINER) {
      // Get all athletes assigned to this trainer
      const relationships =
        await this.trainerAthleteOutPort.findAthletesByTrainer({
          trainerId: jwtPayload.sub,
          status: 'ACTIVE',
        });

      const athleteIds = relationships.map((r) => r.athleteId);

      if (athleteIds.length === 0) {
        return []; // No athletes assigned
      }

      // If specific athleteId is provided, verify it belongs to trainer
      if (athleteId) {
        if (!athleteIds.includes(athleteId)) {
          throw new DomainException(
            InternalErrorCode.FORBIDDEN,
            'You can only view sessions of your assigned athletes',
          );
        }

        const sessions =
          await this.trainingSessionOutPort.findTrainingSessionsByAthlete({
            athleteId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            trainingPlanId:
              trainingPlanId === 'null' ? null : trainingPlanId || undefined,
          });
        return sessions.map((session) => this.mapSessionToDto(session));
      }

      // If no athleteId provided, get sessions for all athletes
      const allSessions: any[] = [];
      for (const athleteId of athleteIds) {
        const sessions =
          await this.trainingSessionOutPort.findTrainingSessionsByAthlete({
            athleteId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            trainingPlanId:
              trainingPlanId === 'null' ? null : trainingPlanId || undefined,
          });
        allSessions.push(...sessions);
      }

      // Sort by date descending
      allSessions.sort(
        (a, b) =>
          new Date(b.actualDate).getTime() - new Date(a.actualDate).getTime(),
      );

      return allSessions.map((session) => this.mapSessionToDto(session));
    }

    // Admins can see all sessions
    if (jwtPayload.role === UserRole.ADMIN) {
      if (!athleteId) {
        throw new DomainException(
          InternalErrorCode.VALIDATION_ERROR,
          'athleteId is required for admins',
        );
      }

      const sessions =
        await this.trainingSessionOutPort.findTrainingSessionsByAthlete({
          athleteId,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          trainingPlanId:
            trainingPlanId === 'null' ? null : trainingPlanId || undefined,
        });
      return sessions.map((session) => this.mapSessionToDto(session));
    }

    throw new DomainException(InternalErrorCode.FORBIDDEN, 'Invalid user role');
  }

  @Get(':id')
  @Authenticated()
  @ApiOperation({ summary: 'Get training session by ID' })
  @ApiResponse({ status: 200, type: TrainingSessionResponseDto })
  async getTrainingSessionById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<TrainingSessionResponseDto> {
    const session = await this.trainingSessionOutPort.findTrainingSessionById({
      id,
    });

    if (!session) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Training session not found',
      );
    }

    // Athletes can only see their own sessions
    // Trainers and admins can see any session
    if (
      jwtPayload.role === UserRole.ATHLETE &&
      session.athleteId !== jwtPayload.sub
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'You can only view your own training sessions',
      );
    }

    return this.mapSessionToDto(session);
  }

  @Patch(':id')
  @Authenticated()
  @ApiOperation({ summary: 'Update training session' })
  @ApiResponse({ status: 200, type: TrainingSessionResponseDto })
  async updateTrainingSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateTrainingSessionDto>,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<TrainingSessionResponseDto> {
    if (jwtPayload.role !== UserRole.ATHLETE) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only athletes can update training sessions',
      );
    }

    const session = await this.trainingSessionOutPort.updateTrainingSession({
      id,
      athleteId: jwtPayload.sub,
      actualDate: dto.actualDate ? new Date(dto.actualDate) : undefined,
      actualParameters: dto.actualParameters,
      notes: dto.notes ?? null,
    });

    return this.mapSessionToDto(session);
  }

  @Delete(':id')
  @Authenticated()
  @ApiOperation({ summary: 'Delete training session' })
  @ApiResponse({ status: 204 })
  async deleteTrainingSession(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<void> {
    if (jwtPayload.role !== UserRole.ATHLETE) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only athletes can delete training sessions',
      );
    }

    await this.trainingSessionOutPort.deleteTrainingSession({
      id,
      athleteId: jwtPayload.sub,
    });
  }

  private mapSessionToDto(session: any): TrainingSessionResponseDto {
    return {
      id: session.id,
      athleteId: session.athleteId,
      workoutType: session.workoutType,
      actualDate: session.actualDate,
      actualParameters: session.actualParameters,
      notes: session.notes,
      trainingPlanId: session.trainingPlanId,
      stravaActivityId: session.stravaActivityId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
