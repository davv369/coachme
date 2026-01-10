import { TrainingPlan } from '../../../domain/training-plan.entity';
import { Workout } from '../../../domain/workout.entity';
import { TrainingPlanStatus } from '../../../domain/training-plan.entity';

export const TRAINING_PLAN_IN_PORT = Symbol('TRAINING_PLAN_IN_PORT');

export interface CreateTrainingPlanCommand {
  trainerId: string;
  athleteId: string;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface UpdateTrainingPlanCommand {
  id: string;
  name?: string;
  description?: string | null;
  status?: TrainingPlanStatus;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface FindTrainingPlanByIdQuery {
  id: string;
}

export interface FindTrainingPlansByTrainerQuery {
  trainerId: string;
}

export interface FindTrainingPlansByAthleteQuery {
  athleteId: string;
}

export interface AddWorkoutToPlanCommand {
  trainingPlanId: string;
  exerciseId: string;
  parameters: Record<string, any>;
  scheduledDate: Date;
  order?: number;
  notes?: string | null;
}

export interface UpdateWorkoutCommand {
  id: string;
  parameters?: Record<string, any>;
  scheduledDate?: Date;
  order?: number;
  notes?: string | null;
}

export interface FindWorkoutsByPlanQuery {
  trainingPlanId: string;
}

export interface FindWorkoutByIdQuery {
  id: string;
}

export interface RemoveWorkoutFromPlanCommand {
  id: string;
  trainingPlanId: string;
}

export interface TrainingPlanInPort {
  createTrainingPlan(command: CreateTrainingPlanCommand): Promise<TrainingPlan>;
  updateTrainingPlan(command: UpdateTrainingPlanCommand): Promise<TrainingPlan>;
  findTrainingPlanById(
    query: FindTrainingPlanByIdQuery,
  ): Promise<TrainingPlan | null>;
  findTrainingPlansByTrainer(
    query: FindTrainingPlansByTrainerQuery,
  ): Promise<TrainingPlan[]>;
  findTrainingPlansByAthlete(
    query: FindTrainingPlansByAthleteQuery,
  ): Promise<TrainingPlan[]>;
  addWorkoutToPlan(command: AddWorkoutToPlanCommand): Promise<Workout>;
  updateWorkout(command: UpdateWorkoutCommand): Promise<Workout>;
  findWorkoutsByPlan(query: FindWorkoutsByPlanQuery): Promise<Workout[]>;
  findWorkoutById(query: FindWorkoutByIdQuery): Promise<Workout | null>;
  removeWorkoutFromPlan(command: RemoveWorkoutFromPlanCommand): Promise<void>;
}
