import { Logger } from '@common/logger/logger';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Knex, knex } from 'knex';
import * as path from 'path';

import {
  TRAINING_PLAN_REPOSITORY_OUT_PORT,
  WORKOUT_REPOSITORY_OUT_PORT,
} from '../../../../../application/ports/out/training-plan-repository.out-port';
import { TrainingPlanDatabaseRepository } from './training-plan.database.repository';
import { WorkoutDatabaseRepository } from './workout.database.repository';

export const TRAINING_PLAN_KNEX_CONNECTION = 'TrainingPlanConnection';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TRAINING_PLAN_KNEX_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<Knex> => {
        const logger = new Logger('TrainingPlanDatabaseModule');
        const host = configService.get<string>('DB_HOST') || 'localhost';
        const port = configService.get<number>('DB_PORT') || 5433;
        const user = configService.get<string>('DB_USER') || 'postgres';
        const password = configService.get<string>('DB_PASSWORD') || 'postgres';
        const database = configService.get<string>('DB_NAME') || 'coachme';
        const ssl = configService.get<string>('DB_SSL') === 'true';

        logger.log(
          `[TrainingPlanDatabaseModule] Connecting to database: ${host}:${port}/${database} as user: ${user}`,
        );

        try {
          const db = knex({
            client: 'pg',
            connection: {
              host,
              port,
              user,
              password,
              database,
              ssl: ssl ? { rejectUnauthorized: false } : false,
            },
            migrations: {
              directory: path.join(__dirname, 'migrations'),
              tableName: 'knex_migrations_training_plans',
            },
          });

          logger.log('[TrainingPlanDatabaseModule] Running migrations...');
          await db.migrate.latest();
          logger.log(
            '[TrainingPlanDatabaseModule] Migrations completed successfully',
          );

          return db;
        } catch (error) {
          logger.error(
            '[TrainingPlanDatabaseModule] Failed to connect to database or run migrations',
            error,
          );
          throw error;
        }
      },
      inject: [ConfigService],
    },
    {
      provide: TRAINING_PLAN_REPOSITORY_OUT_PORT,
      useFactory: (knex: Knex) => new TrainingPlanDatabaseRepository(knex),
      inject: [TRAINING_PLAN_KNEX_CONNECTION],
    },
    {
      provide: WORKOUT_REPOSITORY_OUT_PORT,
      useFactory: (knex: Knex) => new WorkoutDatabaseRepository(knex),
      inject: [TRAINING_PLAN_KNEX_CONNECTION],
    },
  ],
  exports: [TRAINING_PLAN_REPOSITORY_OUT_PORT, WORKOUT_REPOSITORY_OUT_PORT],
})
export class TrainingPlanDatabaseModule {}
