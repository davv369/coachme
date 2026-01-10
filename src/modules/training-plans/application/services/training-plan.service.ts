import { Inject, Injectable } from '@nestjs/common';
import { TrainingPlan } from '../../domain/training-plan.entity';
import { Workout } from '../../domain/workout.entity';
import {
  AddWorkoutToPlanCommand,
  CreateTrainingPlanCommand,
  FindTrainingPlanByIdQuery,
  FindTrainingPlansByAthleteQuery,
  FindTrainingPlansByTrainerQuery,
  FindWorkoutByIdQuery,
  FindWorkoutsByPlanQuery,
  RemoveWorkoutFromPlanCommand,
  TrainingPlanInPort,
  UpdateTrainingPlanCommand,
  UpdateWorkoutCommand,
} from '../ports/in/training-plan.in-port';
import {
  TRAINING_PLAN_REPOSITORY_OUT_PORT,
  TrainingPlanRepositoryOutPort,
  WORKOUT_REPOSITORY_OUT_PORT,
  WorkoutRepositoryOutPort,
} from '../ports/out/training-plan-repository.out-port';
import { TrainingPlanStatus } from '../../domain/training-plan.entity';
import { EXERCISE_IN_PORT } from '@modules/exercises/application/ports/in/exercise.in-port';
import { ExerciseInPort } from '@modules/exercises/application/ports/in/exercise.in-port';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';

@Injectable()
export class TrainingPlanService implements TrainingPlanInPort {
  constructor(
    @Inject(TRAINING_PLAN_REPOSITORY_OUT_PORT)
    private readonly trainingPlanRepository: TrainingPlanRepositoryOutPort,
    @Inject(WORKOUT_REPOSITORY_OUT_PORT)
    private readonly workoutRepository: WorkoutRepositoryOutPort,
    @Inject(EXERCISE_IN_PORT)
    private readonly exerciseInPort: ExerciseInPort,
  ) {}

  async createTrainingPlan(
    command: CreateTrainingPlanCommand,
  ): Promise<TrainingPlan> {
    return this.trainingPlanRepository.create({
      trainerId: command.trainerId,
      athleteId: command.athleteId,
      name: command.name,
      description: command.description ?? null,
      status: TrainingPlanStatus.DRAFT,
      startDate: command.startDate ?? null,
      endDate: command.endDate ?? null,
    });
  }

  async updateTrainingPlan(
    command: UpdateTrainingPlanCommand,
  ): Promise<TrainingPlan> {
    return this.trainingPlanRepository.update({
      id: command.id,
      name: command.name,
      description: command.description,
      status: command.status,
      startDate: command.startDate,
      endDate: command.endDate,
    });
  }

  async findTrainingPlanById(
    query: FindTrainingPlanByIdQuery,
  ): Promise<TrainingPlan | null> {
    return this.trainingPlanRepository.findById({ id: query.id });
  }

  async findTrainingPlansByTrainer(
    query: FindTrainingPlansByTrainerQuery,
  ): Promise<TrainingPlan[]> {
    return this.trainingPlanRepository.findByTrainer({
      trainerId: query.trainerId,
    });
  }

  async findTrainingPlansByAthlete(
    query: FindTrainingPlansByAthleteQuery,
  ): Promise<TrainingPlan[]> {
    return this.trainingPlanRepository.findByAthlete({
      athleteId: query.athleteId,
    });
  }

  async addWorkoutToPlan(command: AddWorkoutToPlanCommand): Promise<Workout> {
    // Validation: check if exercise exists
    const exercise = await this.exerciseInPort.findExerciseById({
      id: command.exerciseId,
    });

    if (!exercise) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Exercise not found',
      );
    }

    // Check if plan exists
    const plan = await this.trainingPlanRepository.findById({
      id: command.trainingPlanId,
    });

    if (!plan) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Training plan not found',
      );
    }

    // If order not provided, find max order in plan and add 1
    let order = command.order;
    if (order === undefined) {
      const existingWorkouts = await this.workoutRepository.findByPlan({
        trainingPlanId: command.trainingPlanId,
      });
      order =
        existingWorkouts.length > 0
          ? Math.max(...existingWorkouts.map((w) => w.order)) + 1
          : 1;
    }

    return this.workoutRepository.create({
      trainingPlanId: command.trainingPlanId,
      exerciseId: command.exerciseId,
      parameters: command.parameters,
      scheduledDate: command.scheduledDate,
      order,
      notes: command.notes ?? null,
    });
  }

  async updateWorkout(command: UpdateWorkoutCommand): Promise<Workout> {
    return this.workoutRepository.update({
      id: command.id,
      parameters: command.parameters,
      scheduledDate: command.scheduledDate,
      order: command.order,
      notes: command.notes,
    });
  }

  async findWorkoutsByPlan(query: FindWorkoutsByPlanQuery): Promise<Workout[]> {
    return this.workoutRepository.findByPlan({
      trainingPlanId: query.trainingPlanId,
    });
  }

  async findWorkoutById(query: FindWorkoutByIdQuery): Promise<Workout | null> {
    return this.workoutRepository.findById({ id: query.id });
  }

  async removeWorkoutFromPlan(
    command: RemoveWorkoutFromPlanCommand,
  ): Promise<void> {
    // Validation: check if workout belongs to plan
    const workout = await this.workoutRepository.findById({ id: command.id });

    if (!workout) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Workout not found',
      );
    }

    if (workout.trainingPlanId !== command.trainingPlanId) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Workout does not belong to this training plan',
      );
    }

    return this.workoutRepository.delete({
      id: command.id,
      trainingPlanId: command.trainingPlanId,
    });
  }
}
