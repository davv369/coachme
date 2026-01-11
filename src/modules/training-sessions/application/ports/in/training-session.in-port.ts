import { TrainingSession } from '../../../domain/training-session.entity';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

export const TRAINING_SESSION_IN_PORT = Symbol('TRAINING_SESSION_IN_PORT');

export interface CreateTrainingSessionCommand {
  athleteId: string;
  workoutType: WorkoutType;
  actualDate: Date;
  actualParameters: Record<string, any>;
  notes?: string | null;
  trainingPlanId?: string | null;
  stravaActivityId?: string | null;
}

export interface UpdateTrainingSessionCommand {
  id: string;
  athleteId: string;
  workoutType?: WorkoutType;
  actualDate?: Date;
  actualParameters?: Record<string, any>;
  notes?: string | null;
}

export interface FindTrainingSessionByIdQuery {
  id: string;
}

export interface FindTrainingSessionsByAthleteQuery {
  athleteId: string;
  startDate?: Date;
  endDate?: Date;
  trainingPlanId?: string | null;
}

export interface FindTrainingSessionByStravaActivityIdQuery {
  athleteId: string;
  stravaActivityId: string;
}

export interface DeleteTrainingSessionCommand {
  id: string;
  athleteId: string;
}

export interface TrainingSessionInPort {
  createTrainingSession(
    command: CreateTrainingSessionCommand,
  ): Promise<TrainingSession>;
  updateTrainingSession(
    command: UpdateTrainingSessionCommand,
  ): Promise<TrainingSession>;
  findTrainingSessionById(
    query: FindTrainingSessionByIdQuery,
  ): Promise<TrainingSession | null>;
  findTrainingSessionsByAthlete(
    query: FindTrainingSessionsByAthleteQuery,
  ): Promise<TrainingSession[]>;
  findTrainingSessionByStravaActivityId(
    query: FindTrainingSessionByStravaActivityIdQuery,
  ): Promise<TrainingSession | null>;
  deleteTrainingSession(command: DeleteTrainingSessionCommand): Promise<void>;
}
