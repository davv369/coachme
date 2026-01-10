import { Logger } from '@common/logger/logger';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Knex, knex } from 'knex';
import * as path from 'path';

import { TRAINING_SESSION_REPOSITORY_OUT_PORT } from '../../../../../application/ports/out/training-session-repository.out-port';
import { TrainingSessionDatabaseRepository } from './training-session.database.repository';

export const TRAINING_SESSION_KNEX_CONNECTION = 'TrainingSessionConnection';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TRAINING_SESSION_KNEX_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<Knex> => {
        const logger = new Logger('TrainingSessionDatabaseModule');
        const host = configService.get<string>('DB_HOST') || 'localhost';
        const port = configService.get<number>('DB_PORT') || 5433;
        const user = configService.get<string>('DB_USER') || 'postgres';
        const password = configService.get<string>('DB_PASSWORD') || 'postgres';
        const database = configService.get<string>('DB_NAME') || 'coachme';
        const ssl = configService.get<string>('DB_SSL') === 'true';

        logger.log(
          `[TrainingSessionDatabaseModule] Connecting to database: ${host}:${port}/${database} as user: ${user}`,
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
              tableName: 'knex_migrations_training_sessions',
            },
          });

          logger.log('[TrainingSessionDatabaseModule] Running migrations...');
          await db.migrate.latest();
          logger.log(
            '[TrainingSessionDatabaseModule] Migrations completed successfully',
          );

          return db;
        } catch (error) {
          logger.error(
            '[TrainingSessionDatabaseModule] Failed to connect to database or run migrations',
            error,
          );
          throw error;
        }
      },
      inject: [ConfigService],
    },
    {
      provide: TRAINING_SESSION_REPOSITORY_OUT_PORT,
      useFactory: (knex: Knex) => new TrainingSessionDatabaseRepository(knex),
      inject: [TRAINING_SESSION_KNEX_CONNECTION],
    },
  ],
  exports: [TRAINING_SESSION_REPOSITORY_OUT_PORT],
})
export class TrainingSessionDatabaseModule {}
