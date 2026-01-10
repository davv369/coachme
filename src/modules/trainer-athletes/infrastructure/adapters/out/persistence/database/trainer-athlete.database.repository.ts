import { Injectable } from '@nestjs/common';
import { TrainerAthlete } from '../../../../../domain/trainer-athlete.entity';
import {
  CreateTrainerAthleteRequest,
  FindTrainerAthleteRequest,
  FindAthletesByTrainerRequest,
  FindTrainersByAthleteRequest,
  UpdateTrainerAthleteStatusRequest,
  DeleteTrainerAthleteRequest,
  TrainerAthleteRepositoryOutPort,
} from '../../../../../application/ports/out/trainer-athlete-repository.out-port';
import { Knex } from 'knex';
import { randomUUID } from 'crypto';
import { TrainerAthleteStatus } from '../../../../../domain/trainer-athlete-status.enum';

interface TrainerAthleteRow {
  id: string;
  trainer_id: string;
  athlete_id: string;
  status: string;
  start_date: Date;
  end_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class TrainerAthleteDatabaseRepository implements TrainerAthleteRepositoryOutPort {
  private readonly tableName = 'trainer_athletes';

  constructor(private readonly knex: Knex) {}

  async create(request: CreateTrainerAthleteRequest): Promise<TrainerAthlete> {
    const now = new Date();
    const id = randomUUID();

    // Check if active relationship already exists
    const existing = await this.knex<TrainerAthleteRow>(this.tableName)
      .where({
        trainer_id: request.trainerId,
        athlete_id: request.athleteId,
        status: TrainerAthleteStatus.ACTIVE,
      })
      .first();

    if (existing) {
      throw new Error(
        'Active relationship between trainer and athlete already exists',
      );
    }

    const [row] = await this.knex<TrainerAthleteRow>(this.tableName)
      .insert({
        id,
        trainer_id: request.trainerId,
        athlete_id: request.athleteId,
        status: TrainerAthleteStatus.ACTIVE,
        start_date: now,
        end_date: null,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return this.mapToTrainerAthlete(row);
  }

  async findByTrainerAndAthlete(
    request: FindTrainerAthleteRequest,
  ): Promise<TrainerAthlete | null> {
    const row = await this.knex<TrainerAthleteRow>(this.tableName)
      .where({
        trainer_id: request.trainerId,
        athlete_id: request.athleteId,
      })
      .orderBy('created_at', 'desc')
      .first();

    return row ? this.mapToTrainerAthlete(row) : null;
  }

  async findAthletesByTrainer(
    request: FindAthletesByTrainerRequest,
  ): Promise<TrainerAthlete[]> {
    const query = this.knex<TrainerAthleteRow>(this.tableName).where({
      trainer_id: request.trainerId,
    });

    if (request.status) {
      query.where('status', request.status);
    }

    query.orderBy('created_at', 'desc');

    const rows = await query;
    return rows.map((row) => this.mapToTrainerAthlete(row));
  }

  async findTrainersByAthlete(
    request: FindTrainersByAthleteRequest,
  ): Promise<TrainerAthlete[]> {
    const query = this.knex<TrainerAthleteRow>(this.tableName).where({
      athlete_id: request.athleteId,
    });

    if (request.status) {
      query.where('status', request.status);
    }

    query.orderBy('created_at', 'desc');

    const rows = await query;
    return rows.map((row) => this.mapToTrainerAthlete(row));
  }

  async updateStatus(
    request: UpdateTrainerAthleteStatusRequest,
  ): Promise<TrainerAthlete> {
    const now = new Date();
    const updateData: Partial<TrainerAthleteRow> = {
      status: request.status,
      updated_at: now,
    };

    if (request.endDate !== undefined) {
      updateData.end_date = request.endDate;
    }

    const [row] = await this.knex<TrainerAthleteRow>(this.tableName)
      .where({ id: request.id })
      .update(updateData)
      .returning('*');

    if (!row) {
      throw new Error('Trainer-athlete relationship not found');
    }

    return this.mapToTrainerAthlete(row);
  }

  async delete(request: DeleteTrainerAthleteRequest): Promise<void> {
    await this.knex<TrainerAthleteRow>(this.tableName)
      .where({ id: request.id })
      .delete();
  }

  private mapToTrainerAthlete(row: TrainerAthleteRow): TrainerAthlete {
    return new TrainerAthlete(
      row.id,
      row.trainer_id,
      row.athlete_id,
      row.status as TrainerAthleteStatus,
      row.start_date,
      row.end_date,
      row.created_at,
      row.updated_at,
    );
  }
}
