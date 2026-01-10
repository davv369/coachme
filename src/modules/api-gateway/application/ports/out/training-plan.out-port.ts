import { TrainingPlan } from '@modules/training-plans/domain/training-plan.entity';
import { Workout } from '@modules/training-plans/domain/workout.entity';
import { TrainingPlanStatus } from '@modules/training-plans/domain/training-plan.entity';

export const TRAINING_PLAN_OUT_PORT = Symbol('TRAINING_PLAN_OUT_PORT');

export interface CreateTrainingPlanRequest {
  trainerId: string;
  athleteId: string;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
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

export interface AddWorkoutToPlanRequest {
  trainingPlanId: string;
  exerciseId: string;
  parameters: Record<string, any>;
  scheduledDate: Date;
  order?: number;
  notes?: string | null;
}

export interface FindWorkoutsByPlanRequest {
  trainingPlanId: string;
}

export interface RemoveWorkoutFromPlanRequest {
  id: string;
  trainingPlanId: string;
}

export interface TrainingPlanOutPort {
  createTrainingPlan(request: CreateTrainingPlanRequest): Promise<TrainingPlan>;
  updateTrainingPlan(request: UpdateTrainingPlanRequest): Promise<TrainingPlan>;
  findTrainingPlanById(
    request: FindTrainingPlanByIdRequest,
  ): Promise<TrainingPlan | null>;
  findTrainingPlansByTrainer(
    request: FindTrainingPlansByTrainerRequest,
  ): Promise<TrainingPlan[]>;
  findTrainingPlansByAthlete(
    request: FindTrainingPlansByAthleteRequest,
  ): Promise<TrainingPlan[]>;
  addWorkoutToPlan(request: AddWorkoutToPlanRequest): Promise<Workout>;
  findWorkoutsByPlan(request: FindWorkoutsByPlanRequest): Promise<Workout[]>;
  removeWorkoutFromPlan(request: RemoveWorkoutFromPlanRequest): Promise<void>;
}
