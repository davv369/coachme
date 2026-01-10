import { Injectable } from '@nestjs/common';
import { Exercise } from '../../../../../domain/exercise.entity';
import { WorkoutType } from '../../../../../domain/workout-type.enum';
import {
  CreateExerciseRequest,
  DeleteExerciseRequest,
  ExerciseRepositoryOutPort,
  FindByIdRequest,
  FindByTrainerRequest,
  FindByWorkoutTypeRequest,
} from '../../../../../application/ports/out/exercise-repository.out-port';
import { Knex } from 'knex';
import { randomUUID } from 'crypto';

interface ExerciseRow {
  id: string;
  trainer_id: string | null;
  name: string;
  description: string;
  workout_type: string;
  parameters_template: any; // JSON
  is_template: boolean;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ExerciseDatabaseRepository implements ExerciseRepositoryOutPort {
  private readonly tableName = 'exercises';

  constructor(private readonly knex: Knex) {}

  async create(request: CreateExerciseRequest): Promise<Exercise> {
    const now = new Date();
    const id = randomUUID();

    // Validate required fields
    if (!request.name) {
      throw new Error('Name is required');
    }
    if (!request.description) {
      throw new Error('Description is required');
    }
    if (!request.workoutType) {
      throw new Error('WorkoutType is required');
    }
    if (!request.parametersTemplate) {
      throw new Error('ParametersTemplate is required');
    }

    const [exerciseRow] = await this.knex<ExerciseRow>(this.tableName)
      .insert({
        id,
        trainer_id: request.trainerId ?? null,
        name: request.name,
        description: request.description,
        workout_type: request.workoutType,
        parameters_template: JSON.stringify(request.parametersTemplate),
        is_template: request.isTemplate ?? true,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return this.mapToExercise(exerciseRow);
  }

  async findById(request: FindByIdRequest): Promise<Exercise | null> {
    const exerciseRow = await this.knex<ExerciseRow>(this.tableName)
      .where({ id: request.id })
      .first();

    return exerciseRow ? this.mapToExercise(exerciseRow) : null;
  }

  async findByTrainer(request: FindByTrainerRequest): Promise<Exercise[]> {
    const query = this.knex<ExerciseRow>(this.tableName);

    if (request.trainerId === null) {
      query.whereNull('trainer_id');
    } else {
      query.where({ trainer_id: request.trainerId });
    }

    const exerciseRows = await query.orderBy('created_at', 'desc');

    return exerciseRows.map((row) => this.mapToExercise(row));
  }

  async findByWorkoutType(
    request: FindByWorkoutTypeRequest,
  ): Promise<Exercise[]> {
    const query = this.knex<ExerciseRow>(this.tableName).where({
      workout_type: request.workoutType,
    });

    if (request.trainerId !== undefined) {
      if (request.trainerId === null) {
        query.whereNull('trainer_id');
      } else {
        query.where({ trainer_id: request.trainerId });
      }
    }

    const exerciseRows = await query.orderBy('created_at', 'desc');

    return exerciseRows.map((row) => this.mapToExercise(row));
  }

  async delete(request: DeleteExerciseRequest): Promise<void> {
    const query = this.knex<ExerciseRow>(this.tableName).where({
      id: request.id,
    });

    // For global exercises (trainerId === null), match where trainer_id is null
    // For trainer's exercises, match both id and trainer_id
    if (request.trainerId === null) {
      query.whereNull('trainer_id');
    } else {
      query.where({ trainer_id: request.trainerId });
    }

    await query.delete();
  }

  private mapToExercise(row: ExerciseRow): Exercise {
    return new Exercise(
      row.id,
      row.trainer_id,
      row.name,
      row.description,
      row.workout_type as WorkoutType,
      typeof row.parameters_template === 'string'
        ? JSON.parse(row.parameters_template)
        : row.parameters_template,
      row.is_template,
      row.created_at,
      row.updated_at,
    );
  }
}
