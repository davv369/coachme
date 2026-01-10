import { TrainingSession } from '@modules/training-sessions/domain/training-session.entity';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

export const TRAINING_SESSION_OUT_PORT = Symbol('TRAINING_SESSION_OUT_PORT');

export interface CreateTrainingSessionRequest {
  athleteId: string;
  workoutType: WorkoutType;
  actualDate: Date;
  actualParameters: Record<string, any>;
  notes: string | null;
  trainingPlanId: string | null;
}

export interface UpdateTrainingSessionRequest {
  id: string;
  athleteId: string;
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
  athleteId: string;
}

export interface TrainingSessionOutPort {
  createTrainingSession(
    request: CreateTrainingSessionRequest,
  ): Promise<TrainingSession>;
  updateTrainingSession(
    request: UpdateTrainingSessionRequest,
  ): Promise<TrainingSession>;
  findTrainingSessionById(
    request: FindTrainingSessionByIdRequest,
  ): Promise<TrainingSession | null>;
  findTrainingSessionsByAthlete(
    request: FindTrainingSessionsByAthleteRequest,
  ): Promise<TrainingSession[]>;
  deleteTrainingSession(request: DeleteTrainingSessionRequest): Promise<void>;
}
