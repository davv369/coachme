import { Inject, Injectable } from '@nestjs/common';
import { TrainerAthlete } from '../../domain/trainer-athlete.entity';
import {
  AssignAthleteCommand,
  RemoveAthleteCommand,
  FindAthletesByTrainerQuery,
  FindTrainersByAthleteQuery,
  TrainerAthleteInPort,
} from '../ports/in/trainer-athlete.in-port';
import {
  TRAINER_ATHLETE_REPOSITORY_OUT_PORT,
  TrainerAthleteRepositoryOutPort,
} from '../ports/out/trainer-athlete-repository.out-port';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import { TrainerAthleteStatus } from '../../domain/trainer-athlete-status.enum';

@Injectable()
export class TrainerAthleteService implements TrainerAthleteInPort {
  constructor(
    @Inject(TRAINER_ATHLETE_REPOSITORY_OUT_PORT)
    private readonly trainerAthleteRepository: TrainerAthleteRepositoryOutPort,
  ) {}

  async assignAthlete(command: AssignAthleteCommand): Promise<TrainerAthlete> {
    // Check if relationship already exists
    const existing =
      await this.trainerAthleteRepository.findByTrainerAndAthlete({
        trainerId: command.trainerId,
        athleteId: command.athleteId,
      });

    if (existing && existing.status === TrainerAthleteStatus.ACTIVE) {
      throw new DomainException(
        InternalErrorCode.VALIDATION_ERROR,
        'Athlete is already assigned to this trainer',
      );
    }

    try {
      return await this.trainerAthleteRepository.create({
        trainerId: command.trainerId,
        athleteId: command.athleteId,
      });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        throw new DomainException(
          InternalErrorCode.VALIDATION_ERROR,
          'Athlete is already assigned to this trainer',
        );
      }
      throw error;
    }
  }

  async removeAthlete(command: RemoveAthleteCommand): Promise<void> {
    const relationship =
      await this.trainerAthleteRepository.findByTrainerAndAthlete({
        trainerId: command.trainerId,
        athleteId: command.athleteId,
      });

    if (!relationship) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Relationship between trainer and athlete not found',
      );
    }

    if (relationship.status === TrainerAthleteStatus.INACTIVE) {
      throw new DomainException(
        InternalErrorCode.VALIDATION_ERROR,
        'Athlete is already removed from this trainer',
      );
    }

    await this.trainerAthleteRepository.updateStatus({
      id: relationship.id,
      status: TrainerAthleteStatus.INACTIVE,
      endDate: new Date(),
    });
  }

  async findAthletesByTrainer(
    query: FindAthletesByTrainerQuery,
  ): Promise<TrainerAthlete[]> {
    return this.trainerAthleteRepository.findAthletesByTrainer({
      trainerId: query.trainerId,
      status: query.status,
    });
  }

  async findTrainersByAthlete(
    query: FindTrainersByAthleteQuery,
  ): Promise<TrainerAthlete[]> {
    return this.trainerAthleteRepository.findTrainersByAthlete({
      athleteId: query.athleteId,
      status: query.status,
    });
  }
}
