import { TrainerAthlete } from '../../../domain/trainer-athlete.entity';

export const TRAINER_ATHLETE_REPOSITORY_OUT_PORT = Symbol(
  'TRAINER_ATHLETE_REPOSITORY_OUT_PORT',
);

export interface CreateTrainerAthleteRequest {
  trainerId: string;
  athleteId: string;
}

export interface FindTrainerAthleteRequest {
  trainerId: string;
  athleteId: string;
}

export interface FindAthletesByTrainerRequest {
  trainerId: string;
  status?: string;
}

export interface FindTrainersByAthleteRequest {
  athleteId: string;
  status?: string;
}

export interface UpdateTrainerAthleteStatusRequest {
  id: string;
  status: string;
  endDate?: Date | null;
}

export interface DeleteTrainerAthleteRequest {
  id: string;
}

export interface TrainerAthleteRepositoryOutPort {
  create(request: CreateTrainerAthleteRequest): Promise<TrainerAthlete>;
  findByTrainerAndAthlete(
    request: FindTrainerAthleteRequest,
  ): Promise<TrainerAthlete | null>;
  findAthletesByTrainer(
    request: FindAthletesByTrainerRequest,
  ): Promise<TrainerAthlete[]>;
  findTrainersByAthlete(
    request: FindTrainersByAthleteRequest,
  ): Promise<TrainerAthlete[]>;
  updateStatus(
    request: UpdateTrainerAthleteStatusRequest,
  ): Promise<TrainerAthlete>;
  delete(request: DeleteTrainerAthleteRequest): Promise<void>;
}
