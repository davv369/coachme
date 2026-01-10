import { Injectable } from '@nestjs/common';
import { TrainingPlan } from '../../../../../domain/training-plan.entity';
import { TrainingPlanStatus } from '../../../../../domain/training-plan.entity';
import {
  CreateTrainingPlanRequest,
  FindTrainingPlanByIdRequest,
  FindTrainingPlansByAthleteRequest,
  FindTrainingPlansByTrainerRequest,
  TrainingPlanRepositoryOutPort,
  UpdateTrainingPlanRequest,
} from '../../../../../application/ports/out/training-plan-repository.out-port';
import { Knex } from 'knex';
import { randomUUID } from 'crypto';

interface TrainingPlanRow {
  id: string;
  trainer_id: string;
  athlete_id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: Date | null;
  end_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class TrainingPlanDatabaseRepository implements TrainingPlanRepositoryOutPort {
  private readonly tableName = 'training_plans';

  constructor(private readonly knex: Knex) {}

  async create(request: CreateTrainingPlanRequest): Promise<TrainingPlan> {
    const now = new Date();
    const id = randomUUID();

    const [planRow] = await this.knex<TrainingPlanRow>(this.tableName)
      .insert({
        id,
        trainer_id: request.trainerId,
        athlete_id: request.athleteId,
        name: request.name,
        description: request.description,
        status: request.status,
        start_date: request.startDate,
        end_date: request.endDate,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return this.mapToTrainingPlan(planRow);
  }

  async update(request: UpdateTrainingPlanRequest): Promise<TrainingPlan> {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (request.name !== undefined) updateData.name = request.name;
    if (request.description !== undefined)
      updateData.description = request.description;
    if (request.status !== undefined) updateData.status = request.status;
    if (request.startDate !== undefined)
      updateData.start_date = request.startDate;
    if (request.endDate !== undefined) updateData.end_date = request.endDate;

    const [planRow] = await this.knex<TrainingPlanRow>(this.tableName)
      .where({ id: request.id })
      .update(updateData)
      .returning('*');

    if (!planRow) {
      throw new Error('Training plan not found');
    }

    return this.mapToTrainingPlan(planRow);
  }

  async findById(
    request: FindTrainingPlanByIdRequest,
  ): Promise<TrainingPlan | null> {
    const planRow = await this.knex<TrainingPlanRow>(this.tableName)
      .where({ id: request.id })
      .first();

    return planRow ? this.mapToTrainingPlan(planRow) : null;
  }

  async findByTrainer(
    request: FindTrainingPlansByTrainerRequest,
  ): Promise<TrainingPlan[]> {
    const planRows = await this.knex<TrainingPlanRow>(this.tableName)
      .where({ trainer_id: request.trainerId })
      .orderBy('created_at', 'desc');

    return planRows.map((row) => this.mapToTrainingPlan(row));
  }

  async findByAthlete(
    request: FindTrainingPlansByAthleteRequest,
  ): Promise<TrainingPlan[]> {
    const planRows = await this.knex<TrainingPlanRow>(this.tableName)
      .where({ athlete_id: request.athleteId })
      .orderBy('created_at', 'desc');

    return planRows.map((row) => this.mapToTrainingPlan(row));
  }

  private mapToTrainingPlan(row: TrainingPlanRow): TrainingPlan {
    return new TrainingPlan(
      row.id,
      row.trainer_id,
      row.athlete_id,
      row.name,
      row.description,
      row.status as TrainingPlanStatus,
      row.start_date,
      row.end_date,
      row.created_at,
      row.updated_at,
    );
  }
}
