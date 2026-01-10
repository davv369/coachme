import { Logger } from '@common/logger/logger';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Knex, knex } from 'knex';
import * as path from 'path';

import { EXERCISE_REPOSITORY_OUT_PORT } from '../../../../../application/ports/out/exercise-repository.out-port';
import { ExerciseDatabaseRepository } from './exercise.database.repository';

export const EXERCISE_KNEX_CONNECTION = 'ExerciseConnection';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EXERCISE_KNEX_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<Knex> => {
        const logger = new Logger('ExerciseDatabaseModule');
        const host = configService.get<string>('DB_HOST') || 'localhost';
        const port = configService.get<number>('DB_PORT') || 5433;
        const user = configService.get<string>('DB_USER') || 'postgres';
        const password = configService.get<string>('DB_PASSWORD') || 'postgres';
        const database = configService.get<string>('DB_NAME') || 'coachme';
        const ssl = configService.get<string>('DB_SSL') === 'true';

        logger.log(
          `[ExerciseDatabaseModule] Connecting to database: ${host}:${port}/${database} as user: ${user}`,
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
              tableName: 'knex_migrations_exercises',
            },
          });

          logger.log('[ExerciseDatabaseModule] Running migrations...');
          await db.migrate.latest();
          logger.log(
            '[ExerciseDatabaseModule] Migrations completed successfully',
          );

          return db;
        } catch (error) {
          logger.error(
            '[ExerciseDatabaseModule] Failed to connect to database or run migrations',
            error,
          );
          throw error;
        }
      },
      inject: [ConfigService],
    },
    {
      provide: EXERCISE_REPOSITORY_OUT_PORT,
      useFactory: (knex: Knex) => new ExerciseDatabaseRepository(knex),
      inject: [EXERCISE_KNEX_CONNECTION],
    },
  ],
  exports: [EXERCISE_REPOSITORY_OUT_PORT],
})
export class ExerciseDatabaseModule {}
