import { Inject, Injectable } from '@nestjs/common';
import {
  AssignAthleteRequest,
  RemoveAthleteRequest,
  FindAthletesByTrainerRequest,
  FindTrainersByAthleteRequest,
  TrainerAthleteOutPort,
} from '../../../application/ports/out/trainer-athlete.out-port';
import {
  TRAINER_ATHLETE_IN_PORT,
  TrainerAthleteInPort,
} from '@modules/trainer-athletes/application/ports/in/trainer-athlete.in-port';

@Injectable()
export class TrainerAthleteInternalOutAdapter implements TrainerAthleteOutPort {
  constructor(
    @Inject(TRAINER_ATHLETE_IN_PORT)
    private readonly trainerAthleteInPort: TrainerAthleteInPort,
  ) {}

  async assignAthlete(request: AssignAthleteRequest): Promise<any> {
    return this.trainerAthleteInPort.assignAthlete({
      trainerId: request.trainerId,
      athleteId: request.athleteId,
    });
  }

  async removeAthlete(request: RemoveAthleteRequest): Promise<void> {
    return this.trainerAthleteInPort.removeAthlete({
      trainerId: request.trainerId,
      athleteId: request.athleteId,
    });
  }

  async findAthletesByTrainer(
    request: FindAthletesByTrainerRequest,
  ): Promise<any[]> {
    return this.trainerAthleteInPort.findAthletesByTrainer({
      trainerId: request.trainerId,
      status: request.status,
    });
  }

  async findTrainersByAthlete(
    request: FindTrainersByAthleteRequest,
  ): Promise<any[]> {
    return this.trainerAthleteInPort.findTrainersByAthlete({
      athleteId: request.athleteId,
      status: request.status,
    });
  }
}
