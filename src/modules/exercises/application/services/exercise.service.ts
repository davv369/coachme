import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import { Exercise } from '../../domain/exercise.entity';
import { filterDefaultsForWorkoutType } from '../../domain/workout-parameters.handler';
import { validateStepsShape } from '../../domain/workout-steps.validator';
import {
  CreateExerciseCommand,
  DeleteExerciseCommand,
  ExerciseInPort,
  FindExerciseByIdQuery,
  FindExercisesByTrainerQuery,
  FindExercisesByWorkoutTypeQuery,
} from '../ports/in/exercise.in-port';
import {
  EXERCISE_REPOSITORY_OUT_PORT,
  ExerciseRepositoryOutPort,
} from '../ports/out/exercise-repository.out-port';

@Injectable()
export class ExerciseService implements ExerciseInPort {
  constructor(
    @Inject(EXERCISE_REPOSITORY_OUT_PORT)
    private readonly exerciseRepository: ExerciseRepositoryOutPort,
  ) {}

  async createExercise(command: CreateExerciseCommand): Promise<Exercise> {
    const raw = (command.parametersTemplate.defaults ?? {}) as Record<
      string,
      unknown
    >;
    const defaults = filterDefaultsForWorkoutType(command.workoutType, raw);
    if (defaults.steps !== undefined) {
      validateStepsShape(defaults.steps, command.workoutType);
    }
    return this.exerciseRepository.create({
      trainerId: command.trainerId,
      name: command.name,
      description: command.description,
      workoutType: command.workoutType,
      parametersTemplate: { defaults },
      isTemplate: command.isTemplate,
    });
  }

  async findExerciseById(
    query: FindExerciseByIdQuery,
  ): Promise<Exercise | null> {
    return this.exerciseRepository.findById({ id: query.id });
  }

  async findExercisesByTrainer(
    query: FindExercisesByTrainerQuery,
  ): Promise<Exercise[]> {
    return this.exerciseRepository.findByTrainer({
      trainerId: query.trainerId,
    });
  }

  async findExercisesByWorkoutType(
    query: FindExercisesByWorkoutTypeQuery,
  ): Promise<Exercise[]> {
    return this.exerciseRepository.findByWorkoutType({
      workoutType: query.workoutType,
      trainerId: query.trainerId,
    });
  }

  async deleteExercise(command: DeleteExerciseCommand): Promise<void> {
    // Validation: check if exercise exists
    const exercise = await this.exerciseRepository.findById({ id: command.id });

    if (!exercise) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Exercise not found',
      );
    }

    // Only trainer who created the exercise can delete it
    // For global exercises (trainerId === null), this check should be done at controller level
    if (
      exercise.trainerId !== null &&
      exercise.trainerId !== command.trainerId
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'You can only delete your own exercises',
      );
    }

    return this.exerciseRepository.delete({
      id: command.id,
      trainerId: command.trainerId,
    });
  }
}
