import { Injectable } from '@nestjs/common';
import { Workout } from '../../../../../domain/workout.entity';
import {
  CreateWorkoutRequest,
  DeleteWorkoutRequest,
  FindWorkoutByIdRequest,
  FindWorkoutsByPlanRequest,
  UpdateWorkoutRequest,
  WorkoutRepositoryOutPort,
} from '../../../../../application/ports/out/training-plan-repository.out-port';
import { Knex } from 'knex';
import { randomUUID } from 'crypto';

interface WorkoutRow {
  id: string;
  training_plan_id: string;
  exercise_id: string;
  parameters: any; // JSON
  scheduled_date: Date;
  order: number;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class WorkoutDatabaseRepository implements WorkoutRepositoryOutPort {
  private readonly tableName = 'workouts';

  constructor(private readonly knex: Knex) {}

  async create(request: CreateWorkoutRequest): Promise<Workout> {
    const now = new Date();
    const id = randomUUID();

    const [workoutRow] = await this.knex<WorkoutRow>(this.tableName)
      .insert({
        id,
        training_plan_id: request.trainingPlanId,
        exercise_id: request.exerciseId,
        parameters: JSON.stringify(request.parameters),
        scheduled_date: request.scheduledDate,
        order: request.order,
        notes: request.notes,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return this.mapToWorkout(workoutRow);
  }

  async update(request: UpdateWorkoutRequest): Promise<Workout> {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (request.parameters !== undefined)
      updateData.parameters = JSON.stringify(request.parameters);
    if (request.scheduledDate !== undefined)
      updateData.scheduled_date = request.scheduledDate;
    if (request.order !== undefined) updateData.order = request.order;
    if (request.notes !== undefined) updateData.notes = request.notes;

    const [workoutRow] = await this.knex<WorkoutRow>(this.tableName)
      .where({ id: request.id })
      .update(updateData)
      .returning('*');

    if (!workoutRow) {
      throw new Error('Workout not found');
    }

    return this.mapToWorkout(workoutRow);
  }

  async findByPlan(request: FindWorkoutsByPlanRequest): Promise<Workout[]> {
    const workoutRows = await this.knex<WorkoutRow>(this.tableName)
      .where({ training_plan_id: request.trainingPlanId })
      .orderBy('order', 'asc')
      .orderBy('scheduled_date', 'asc');

    return workoutRows.map((row) => this.mapToWorkout(row));
  }

  async findById(request: FindWorkoutByIdRequest): Promise<Workout | null> {
    const workoutRow = await this.knex<WorkoutRow>(this.tableName)
      .where({ id: request.id })
      .first();

    return workoutRow ? this.mapToWorkout(workoutRow) : null;
  }

  async delete(request: DeleteWorkoutRequest): Promise<void> {
    await this.knex<WorkoutRow>(this.tableName)
      .where({ id: request.id, training_plan_id: request.trainingPlanId })
      .delete();
  }

  private mapToWorkout(row: WorkoutRow): Workout {
    return new Workout(
      row.id,
      row.training_plan_id,
      row.exercise_id,
      typeof row.parameters === 'string'
        ? JSON.parse(row.parameters)
        : row.parameters,
      row.scheduled_date,
      row.order,
      row.notes,
      row.created_at,
      row.updated_at,
    );
  }
}
