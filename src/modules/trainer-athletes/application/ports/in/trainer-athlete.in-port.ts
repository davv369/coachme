import { TrainerAthlete } from '../../../domain/trainer-athlete.entity';

export const TRAINER_ATHLETE_IN_PORT = Symbol('TRAINER_ATHLETE_IN_PORT');

export interface AssignAthleteCommand {
  trainerId: string;
  athleteId: string;
}

export interface RemoveAthleteCommand {
  trainerId: string;
  athleteId: string;
}

export interface FindAthletesByTrainerQuery {
  trainerId: string;
  status?: string;
}

export interface FindTrainersByAthleteQuery {
  athleteId: string;
  status?: string;
}

export interface TrainerAthleteInPort {
  assignAthlete(command: AssignAthleteCommand): Promise<TrainerAthlete>;
  removeAthlete(command: RemoveAthleteCommand): Promise<void>;
  findAthletesByTrainer(
    query: FindAthletesByTrainerQuery,
  ): Promise<TrainerAthlete[]>;
  findTrainersByAthlete(
    query: FindTrainersByAthleteQuery,
  ): Promise<TrainerAthlete[]>;
}
