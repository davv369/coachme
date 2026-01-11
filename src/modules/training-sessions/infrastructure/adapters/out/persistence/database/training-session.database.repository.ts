import { Injectable } from '@nestjs/common';
import { TrainingSession } from '../../../../../domain/training-session.entity';
import {
  CreateTrainingSessionRequest,
  UpdateTrainingSessionRequest,
  FindTrainingSessionByIdRequest,
  FindTrainingSessionsByAthleteRequest,
  FindTrainingSessionByStravaActivityIdRequest,
  DeleteTrainingSessionRequest,
  TrainingSessionRepositoryOutPort,
} from '../../../../../application/ports/out/training-session-repository.out-port';
import { Knex } from 'knex';
import { randomUUID } from 'crypto';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

interface TrainingSessionRow {
  id: string;
  athlete_id: string;
  workout_type: string;
  actual_date: Date;
  actual_parameters: Record<string, any>;
  notes: string | null;
  training_plan_id: string | null;
  strava_activity_id: string | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class TrainingSessionDatabaseRepository implements TrainingSessionRepositoryOutPort {
  private readonly tableName = 'training_sessions';

  constructor(private readonly knex: Knex) {}

  async create(
    request: CreateTrainingSessionRequest,
  ): Promise<TrainingSession> {
    const now = new Date();
    const id = randomUUID();

    const [sessionRow] = await this.knex<TrainingSessionRow>(this.tableName)
      .insert({
        id,
        athlete_id: request.athleteId,
        workout_type: request.workoutType,
        actual_date: request.actualDate,
        actual_parameters: request.actualParameters,
        notes: request.notes,
        training_plan_id: request.trainingPlanId,
        strava_activity_id: request.stravaActivityId ?? null,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return this.mapToTrainingSession(sessionRow);
  }

  async update(
    request: UpdateTrainingSessionRequest,
  ): Promise<TrainingSession> {
    const now = new Date();
    const updateData: Partial<TrainingSessionRow> = {
      updated_at: now,
    };

    if (request.workoutType !== undefined) {
      updateData.workout_type = request.workoutType;
    }
    if (request.actualDate !== undefined) {
      updateData.actual_date = request.actualDate;
    }
    if (request.actualParameters !== undefined) {
      updateData.actual_parameters = request.actualParameters;
    }
    if (request.notes !== undefined) {
      updateData.notes = request.notes;
    }

    const [sessionRow] = await this.knex<TrainingSessionRow>(this.tableName)
      .where({ id: request.id })
      .update(updateData)
      .returning('*');

    if (!sessionRow) {
      throw new Error('Training session not found');
    }

    return this.mapToTrainingSession(sessionRow);
  }

  async findById(
    request: FindTrainingSessionByIdRequest,
  ): Promise<TrainingSession | null> {
    const sessionRow = await this.knex<TrainingSessionRow>(this.tableName)
      .where({ id: request.id })
      .first();

    return sessionRow ? this.mapToTrainingSession(sessionRow) : null;
  }

  async findByAthlete(
    request: FindTrainingSessionsByAthleteRequest,
  ): Promise<TrainingSession[]> {
    const query = this.knex<TrainingSessionRow>(this.tableName).where({
      athlete_id: request.athleteId,
    });

    if (request.startDate) {
      query.where('actual_date', '>=', request.startDate);
    }

    if (request.endDate) {
      query.where('actual_date', '<=', request.endDate);
    }

    if (request.trainingPlanId !== undefined) {
      if (request.trainingPlanId === null) {
        query.whereNull('training_plan_id');
      } else {
        query.where({ training_plan_id: request.trainingPlanId });
      }
    }

    query.orderBy('actual_date', 'desc');

    const sessionRows = await query;

    return sessionRows.map((row) => this.mapToTrainingSession(row));
  }

  async findByStravaActivityId(
    request: FindTrainingSessionByStravaActivityIdRequest,
  ): Promise<TrainingSession | null> {
    const sessionRow = await this.knex<TrainingSessionRow>(this.tableName)
      .where({
        athlete_id: request.athleteId,
        strava_activity_id: request.stravaActivityId,
      })
      .first();

    return sessionRow ? this.mapToTrainingSession(sessionRow) : null;
  }

  async delete(request: DeleteTrainingSessionRequest): Promise<void> {
    await this.knex<TrainingSessionRow>(this.tableName)
      .where({ id: request.id })
      .delete();
  }

  private mapToTrainingSession(row: TrainingSessionRow): TrainingSession {
    return new TrainingSession(
      row.id,
      row.athlete_id,
      row.workout_type as WorkoutType,
      row.actual_date,
      row.actual_parameters,
      row.notes,
      row.training_plan_id,
      row.strava_activity_id,
      row.created_at,
      row.updated_at,
    );
  }
}
