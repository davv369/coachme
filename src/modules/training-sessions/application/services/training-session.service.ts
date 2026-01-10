import { Inject, Injectable } from '@nestjs/common';
import { TrainingSession } from '../../domain/training-session.entity';
import {
  CreateTrainingSessionCommand,
  UpdateTrainingSessionCommand,
  FindTrainingSessionByIdQuery,
  FindTrainingSessionsByAthleteQuery,
  DeleteTrainingSessionCommand,
  TrainingSessionInPort,
} from '../ports/in/training-session.in-port';
import {
  TRAINING_SESSION_REPOSITORY_OUT_PORT,
  TrainingSessionRepositoryOutPort,
} from '../ports/out/training-session-repository.out-port';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';

@Injectable()
export class TrainingSessionService implements TrainingSessionInPort {
  constructor(
    @Inject(TRAINING_SESSION_REPOSITORY_OUT_PORT)
    private readonly trainingSessionRepository: TrainingSessionRepositoryOutPort,
  ) {}

  async createTrainingSession(
    command: CreateTrainingSessionCommand,
  ): Promise<TrainingSession> {
    return this.trainingSessionRepository.create({
      athleteId: command.athleteId,
      workoutType: command.workoutType,
      actualDate: command.actualDate,
      actualParameters: command.actualParameters,
      notes: command.notes ?? null,
      trainingPlanId: command.trainingPlanId ?? null,
    });
  }

  async updateTrainingSession(
    command: UpdateTrainingSessionCommand,
  ): Promise<TrainingSession> {
    const session = await this.trainingSessionRepository.findById({
      id: command.id,
    });

    if (!session) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Training session not found',
      );
    }

    if (session.athleteId !== command.athleteId) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'You can only update your own training sessions',
      );
    }

    return this.trainingSessionRepository.update({
      id: command.id,
      actualDate: command.actualDate,
      actualParameters: command.actualParameters,
      notes: command.notes ?? null,
    });
  }

  async findTrainingSessionById(
    query: FindTrainingSessionByIdQuery,
  ): Promise<TrainingSession | null> {
    return this.trainingSessionRepository.findById({ id: query.id });
  }

  async findTrainingSessionsByAthlete(
    query: FindTrainingSessionsByAthleteQuery,
  ): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.findByAthlete({
      athleteId: query.athleteId,
      startDate: query.startDate,
      endDate: query.endDate,
      trainingPlanId: query.trainingPlanId,
    });
  }

  async deleteTrainingSession(
    command: DeleteTrainingSessionCommand,
  ): Promise<void> {
    const session = await this.trainingSessionRepository.findById({
      id: command.id,
    });

    if (!session) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Training session not found',
      );
    }

    if (session.athleteId !== command.athleteId) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'You can only delete your own training sessions',
      );
    }

    return this.trainingSessionRepository.delete({ id: command.id });
  }
}
