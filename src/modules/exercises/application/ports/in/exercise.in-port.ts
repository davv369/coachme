import { Exercise } from '../../../domain/exercise.entity';
import { WorkoutType } from '../../../domain/workout-type.enum';

export const EXERCISE_IN_PORT = Symbol('EXERCISE_IN_PORT');

export interface CreateExerciseCommand {
  trainerId: string | null; // null = globalne/systemowe
  name: string;
  description: string;
  workoutType: WorkoutType;
  parametersTemplate: {
    defaults: Record<string, any>;
  };
  isTemplate: boolean;
}

export interface FindExerciseByIdQuery {
  id: string;
}

export interface FindExercisesByTrainerQuery {
  trainerId: string | null; // null = tylko globalne
}

export interface FindExercisesByWorkoutTypeQuery {
  workoutType: WorkoutType;
  trainerId?: string | null; // opcjonalne filtrowanie po trenerze
}

export interface DeleteExerciseCommand {
  id: string;
  trainerId: string | null; // null for global exercises
}

export interface ExerciseInPort {
  createExercise(command: CreateExerciseCommand): Promise<Exercise>;
  findExerciseById(query: FindExerciseByIdQuery): Promise<Exercise | null>;
  findExercisesByTrainer(
    query: FindExercisesByTrainerQuery,
  ): Promise<Exercise[]>;
  findExercisesByWorkoutType(
    query: FindExercisesByWorkoutTypeQuery,
  ): Promise<Exercise[]>;
  deleteExercise(command: DeleteExerciseCommand): Promise<void>;
}
