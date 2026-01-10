import { TrainerAthlete } from '@modules/trainer-athletes/domain/trainer-athlete.entity';

export const TRAINER_ATHLETE_OUT_PORT = Symbol('TRAINER_ATHLETE_OUT_PORT');

export interface AssignAthleteRequest {
  trainerId: string;
  athleteId: string;
}

export interface RemoveAthleteRequest {
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

export interface TrainerAthleteOutPort {
  assignAthlete(request: AssignAthleteRequest): Promise<TrainerAthlete>;
  removeAthlete(request: RemoveAthleteRequest): Promise<void>;
  findAthletesByTrainer(
    request: FindAthletesByTrainerRequest,
  ): Promise<TrainerAthlete[]>;
  findTrainersByAthlete(
    request: FindTrainersByAthleteRequest,
  ): Promise<TrainerAthlete[]>;
}
