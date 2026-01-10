import { Inject, Injectable } from '@nestjs/common';
import { Exercise } from '@modules/exercises/domain/exercise.entity';
import { EXERCISE_IN_PORT } from '@modules/exercises/application/ports/in/exercise.in-port';
import { ExerciseInPort } from '@modules/exercises/application/ports/in/exercise.in-port';
import {
  CreateExerciseRequest,
  DeleteExerciseRequest,
  ExerciseOutPort,
  FindExerciseByIdRequest,
  FindExercisesByTrainerRequest,
  FindExercisesByWorkoutTypeRequest,
} from '../../../application/ports/out/exercise.out-port';

@Injectable()
export class ExerciseInternalOutAdapter implements ExerciseOutPort {
  constructor(
    @Inject(EXERCISE_IN_PORT)
    private readonly exerciseInPort: ExerciseInPort,
  ) {}

  async createExercise(request: CreateExerciseRequest): Promise<Exercise> {
    return this.exerciseInPort.createExercise({
      trainerId: request.trainerId,
      name: request.name,
      description: request.description,
      workoutType: request.workoutType,
      parametersTemplate: request.parametersTemplate,
      isTemplate: request.isTemplate,
    });
  }

  async findExerciseById(
    request: FindExerciseByIdRequest,
  ): Promise<Exercise | null> {
    return this.exerciseInPort.findExerciseById({ id: request.id });
  }

  async findExercisesByTrainer(
    request: FindExercisesByTrainerRequest,
  ): Promise<Exercise[]> {
    return this.exerciseInPort.findExercisesByTrainer({
      trainerId: request.trainerId,
    });
  }

  async findExercisesByWorkoutType(
    request: FindExercisesByWorkoutTypeRequest,
  ): Promise<Exercise[]> {
    return this.exerciseInPort.findExercisesByWorkoutType({
      workoutType: request.workoutType,
      trainerId: request.trainerId,
    });
  }

  async deleteExercise(request: DeleteExerciseRequest): Promise<void> {
    return this.exerciseInPort.deleteExercise({
      id: request.id,
      trainerId: request.trainerId,
    });
  }
}
