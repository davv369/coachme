import { TrainingPlan } from '../../../domain/training-plan.entity';
import { TrainingPlanStatus } from '../../../domain/training-plan.entity';
import { Workout } from '../../../domain/workout.entity';

export const TRAINING_PLAN_REPOSITORY_OUT_PORT = Symbol(
  'TRAINING_PLAN_REPOSITORY_OUT_PORT',
);
export const WORKOUT_REPOSITORY_OUT_PORT = Symbol(
  'WORKOUT_REPOSITORY_OUT_PORT',
);

export interface CreateTrainingPlanRequest {
  trainerId: string;
  athleteId: string;
  name: string;
  description: string | null;
  status: TrainingPlanStatus;
  startDate: Date | null;
  endDate: Date | null;
}

export interface UpdateTrainingPlanRequest {
  id: string;
  name?: string;
  description?: string | null;
  status?: TrainingPlanStatus;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface FindTrainingPlanByIdRequest {
  id: string;
}

export interface FindTrainingPlansByTrainerRequest {
  trainerId: string;
}

export interface FindTrainingPlansByAthleteRequest {
  athleteId: string;
}

export interface CreateWorkoutRequest {
  trainingPlanId: string;
  exerciseId: string;
  parameters: Record<string, any>;
  scheduledDate: Date;
  order: number;
  notes: string | null;
}

export interface UpdateWorkoutRequest {
  id: string;
  parameters?: Record<string, any>;
  scheduledDate?: Date;
  order?: number;
  notes?: string | null;
}

export interface FindWorkoutsByPlanRequest {
  trainingPlanId: string;
}

export interface FindWorkoutByIdRequest {
  id: string;
}

export interface DeleteWorkoutRequest {
  id: string;
  trainingPlanId: string;
}

export interface TrainingPlanRepositoryOutPort {
  create(request: CreateTrainingPlanRequest): Promise<TrainingPlan>;
  update(request: UpdateTrainingPlanRequest): Promise<TrainingPlan>;
  findById(request: FindTrainingPlanByIdRequest): Promise<TrainingPlan | null>;
  findByTrainer(
    request: FindTrainingPlansByTrainerRequest,
  ): Promise<TrainingPlan[]>;
  findByAthlete(
    request: FindTrainingPlansByAthleteRequest,
  ): Promise<TrainingPlan[]>;
}

export interface WorkoutRepositoryOutPort {
  create(request: CreateWorkoutRequest): Promise<Workout>;
  update(request: UpdateWorkoutRequest): Promise<Workout>;
  findByPlan(request: FindWorkoutsByPlanRequest): Promise<Workout[]>;
  findById(request: FindWorkoutByIdRequest): Promise<Workout | null>;
  delete(request: DeleteWorkoutRequest): Promise<void>;
}
