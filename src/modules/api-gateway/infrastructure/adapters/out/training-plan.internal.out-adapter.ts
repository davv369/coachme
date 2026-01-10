import { Inject, Injectable } from '@nestjs/common';
import { TrainingPlan } from '@modules/training-plans/domain/training-plan.entity';
import { Workout } from '@modules/training-plans/domain/workout.entity';
import { TRAINING_PLAN_IN_PORT } from '@modules/training-plans/application/ports/in/training-plan.in-port';
import { TrainingPlanInPort } from '@modules/training-plans/application/ports/in/training-plan.in-port';
import {
  AddWorkoutToPlanRequest,
  CreateTrainingPlanRequest,
  FindTrainingPlanByIdRequest,
  FindTrainingPlansByAthleteRequest,
  FindTrainingPlansByTrainerRequest,
  FindWorkoutsByPlanRequest,
  RemoveWorkoutFromPlanRequest,
  TrainingPlanOutPort,
  UpdateTrainingPlanRequest,
} from '../../../application/ports/out/training-plan.out-port';

@Injectable()
export class TrainingPlanInternalOutAdapter implements TrainingPlanOutPort {
  constructor(
    @Inject(TRAINING_PLAN_IN_PORT)
    private readonly trainingPlanInPort: TrainingPlanInPort,
  ) {}

  async createTrainingPlan(
    request: CreateTrainingPlanRequest,
  ): Promise<TrainingPlan> {
    return this.trainingPlanInPort.createTrainingPlan({
      trainerId: request.trainerId,
      athleteId: request.athleteId,
      name: request.name,
      description: request.description,
      startDate: request.startDate,
      endDate: request.endDate,
    });
  }

  async updateTrainingPlan(
    request: UpdateTrainingPlanRequest,
  ): Promise<TrainingPlan> {
    return this.trainingPlanInPort.updateTrainingPlan({
      id: request.id,
      name: request.name,
      description: request.description,
      status: request.status,
      startDate: request.startDate,
      endDate: request.endDate,
    });
  }

  async findTrainingPlanById(
    request: FindTrainingPlanByIdRequest,
  ): Promise<TrainingPlan | null> {
    return this.trainingPlanInPort.findTrainingPlanById({ id: request.id });
  }

  async findTrainingPlansByTrainer(
    request: FindTrainingPlansByTrainerRequest,
  ): Promise<TrainingPlan[]> {
    return this.trainingPlanInPort.findTrainingPlansByTrainer({
      trainerId: request.trainerId,
    });
  }

  async findTrainingPlansByAthlete(
    request: FindTrainingPlansByAthleteRequest,
  ): Promise<TrainingPlan[]> {
    return this.trainingPlanInPort.findTrainingPlansByAthlete({
      athleteId: request.athleteId,
    });
  }

  async addWorkoutToPlan(request: AddWorkoutToPlanRequest): Promise<Workout> {
    return this.trainingPlanInPort.addWorkoutToPlan({
      trainingPlanId: request.trainingPlanId,
      exerciseId: request.exerciseId,
      parameters: request.parameters,
      scheduledDate: request.scheduledDate,
      order: request.order,
      notes: request.notes,
    });
  }

  async findWorkoutsByPlan(
    request: FindWorkoutsByPlanRequest,
  ): Promise<Workout[]> {
    return this.trainingPlanInPort.findWorkoutsByPlan({
      trainingPlanId: request.trainingPlanId,
    });
  }

  async removeWorkoutFromPlan(
    request: RemoveWorkoutFromPlanRequest,
  ): Promise<void> {
    return this.trainingPlanInPort.removeWorkoutFromPlan({
      id: request.id,
      trainingPlanId: request.trainingPlanId,
    });
  }
}
