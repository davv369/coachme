import { Exercise } from '@modules/exercises/domain/exercise.entity';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

export const EXERCISE_OUT_PORT = Symbol('EXERCISE_OUT_PORT');

export interface CreateExerciseRequest {
  trainerId: string | null;
  name: string;
  description: string;
  workoutType: WorkoutType;
  parametersTemplate: { defaults: Record<string, any> };
  isTemplate: boolean;
}

export interface FindExerciseByIdRequest {
  id: string;
}

export interface FindExercisesByTrainerRequest {
  trainerId: string | null;
}

export interface FindExercisesByWorkoutTypeRequest {
  workoutType: WorkoutType;
  trainerId?: string | null;
}

export interface DeleteExerciseRequest {
  id: string;
  trainerId: string | null;
}

export interface ExerciseOutPort {
  createExercise(request: CreateExerciseRequest): Promise<Exercise>;
  findExerciseById(request: FindExerciseByIdRequest): Promise<Exercise | null>;
  findExercisesByTrainer(
    request: FindExercisesByTrainerRequest,
  ): Promise<Exercise[]>;
  findExercisesByWorkoutType(
    request: FindExercisesByWorkoutTypeRequest,
  ): Promise<Exercise[]>;
  deleteExercise(request: DeleteExerciseRequest): Promise<void>;
}
