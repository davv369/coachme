import { Inject, Injectable } from '@nestjs/common';
import { Exercise } from '../../domain/exercise.entity';
import {
  CreateExerciseCommand,
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
    return this.exerciseRepository.create({
      trainerId: command.trainerId,
      name: command.name,
      description: command.description,
      workoutType: command.workoutType,
      parametersTemplate: command.parametersTemplate,
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
}
