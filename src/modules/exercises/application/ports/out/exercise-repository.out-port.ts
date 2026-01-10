import { Exercise } from '../../../domain/exercise.entity';
import { WorkoutType } from '../../../domain/workout-type.enum';

export const EXERCISE_REPOSITORY_OUT_PORT = Symbol(
  'EXERCISE_REPOSITORY_OUT_PORT',
);

export interface CreateExerciseRequest {
  trainerId: string | null;
  name: string;
  description: string;
  workoutType: string;
  parametersTemplate: {
    schema: {
      [key: string]: {
        type: 'number' | 'string' | 'boolean';
        label: string;
        unit?: string;
        min?: number;
        max?: number;
        required?: boolean;
        default?: any;
      };
    };
    defaults: Record<string, any>;
  };
  isTemplate: boolean;
}

export interface FindByIdRequest {
  id: string;
}

export interface FindByTrainerRequest {
  trainerId: string | null;
}

export interface FindByWorkoutTypeRequest {
  workoutType: WorkoutType;
  trainerId?: string | null;
}

export interface ExerciseRepositoryOutPort {
  create(request: CreateExerciseRequest): Promise<Exercise>;
  findById(request: FindByIdRequest): Promise<Exercise | null>;
  findByTrainer(request: FindByTrainerRequest): Promise<Exercise[]>;
  findByWorkoutType(request: FindByWorkoutTypeRequest): Promise<Exercise[]>;
}
