import { TrainingSession } from '../../../domain/training-session.entity';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

export const TRAINING_SESSION_REPOSITORY_OUT_PORT = Symbol(
  'TRAINING_SESSION_REPOSITORY_OUT_PORT',
);

export interface CreateTrainingSessionRequest {
  athleteId: string;
  workoutType: WorkoutType;
  actualDate: Date;
  actualParameters: Record<string, any>;
  notes: string | null;
  trainingPlanId: string | null;
  stravaActivityId?: string | null;
}

export interface UpdateTrainingSessionRequest {
  id: string;
  workoutType?: WorkoutType;
  actualDate?: Date;
  actualParameters?: Record<string, any>;
  notes?: string | null;
}

export interface FindTrainingSessionByIdRequest {
  id: string;
}

export interface FindTrainingSessionsByAthleteRequest {
  athleteId: string;
  startDate?: Date;
  endDate?: Date;
  trainingPlanId?: string | null;
}

export interface DeleteTrainingSessionRequest {
  id: string;
}

export interface FindTrainingSessionByStravaActivityIdRequest {
  athleteId: string;
  stravaActivityId: string;
}

export interface TrainingSessionRepositoryOutPort {
  create(request: CreateTrainingSessionRequest): Promise<TrainingSession>;
  update(request: UpdateTrainingSessionRequest): Promise<TrainingSession>;
  findById(
    request: FindTrainingSessionByIdRequest,
  ): Promise<TrainingSession | null>;
  findByAthlete(
    request: FindTrainingSessionsByAthleteRequest,
  ): Promise<TrainingSession[]>;
  findByStravaActivityId(
    request: FindTrainingSessionByStravaActivityIdRequest,
  ): Promise<TrainingSession | null>;
  delete(request: DeleteTrainingSessionRequest): Promise<void>;
}
