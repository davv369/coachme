import { Inject, Injectable } from '@nestjs/common';
import {
  CreateTrainingSessionRequest,
  UpdateTrainingSessionRequest,
  FindTrainingSessionByIdRequest,
  FindTrainingSessionsByAthleteRequest,
  DeleteTrainingSessionRequest,
  TrainingSessionOutPort,
} from '../../../application/ports/out/training-session.out-port';
import {
  TRAINING_SESSION_IN_PORT,
  TrainingSessionInPort,
} from '@modules/training-sessions/application/ports/in/training-session.in-port';

@Injectable()
export class TrainingSessionInternalOutAdapter implements TrainingSessionOutPort {
  constructor(
    @Inject(TRAINING_SESSION_IN_PORT)
    private readonly trainingSessionInPort: TrainingSessionInPort,
  ) {}

  async createTrainingSession(
    request: CreateTrainingSessionRequest,
  ): Promise<any> {
    return this.trainingSessionInPort.createTrainingSession({
      athleteId: request.athleteId,
      workoutType: request.workoutType,
      actualDate: request.actualDate,
      actualParameters: request.actualParameters,
      notes: request.notes,
      trainingPlanId: request.trainingPlanId,
    });
  }

  async updateTrainingSession(
    request: UpdateTrainingSessionRequest,
  ): Promise<any> {
    return this.trainingSessionInPort.updateTrainingSession({
      id: request.id,
      athleteId: request.athleteId,
      actualDate: request.actualDate,
      actualParameters: request.actualParameters,
      notes: request.notes,
    });
  }

  async findTrainingSessionById(
    request: FindTrainingSessionByIdRequest,
  ): Promise<any> {
    return this.trainingSessionInPort.findTrainingSessionById({
      id: request.id,
    });
  }

  async findTrainingSessionsByAthlete(
    request: FindTrainingSessionsByAthleteRequest,
  ): Promise<any[]> {
    return this.trainingSessionInPort.findTrainingSessionsByAthlete({
      athleteId: request.athleteId,
      startDate: request.startDate,
      endDate: request.endDate,
      trainingPlanId: request.trainingPlanId,
    });
  }

  async deleteTrainingSession(
    request: DeleteTrainingSessionRequest,
  ): Promise<void> {
    return this.trainingSessionInPort.deleteTrainingSession({
      id: request.id,
      athleteId: request.athleteId,
    });
  }
}
