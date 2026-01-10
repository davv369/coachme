import { Logger } from '@common/logger/logger';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Knex, knex } from 'knex';
import * as path from 'path';

import { TRAINER_ATHLETE_REPOSITORY_OUT_PORT } from '../../../../../application/ports/out/trainer-athlete-repository.out-port';
import { TrainerAthleteDatabaseRepository } from './trainer-athlete.database.repository';

export const TRAINER_ATHLETE_KNEX_CONNECTION = 'TrainerAthleteConnection';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TRAINER_ATHLETE_KNEX_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<Knex> => {
        const logger = new Logger('TrainerAthleteDatabaseModule');
        const host = configService.get<string>('DB_HOST') || 'localhost';
        const port = configService.get<number>('DB_PORT') || 5433;
        const user = configService.get<string>('DB_USER') || 'postgres';
        const password = configService.get<string>('DB_PASSWORD') || 'postgres';
        const database = configService.get<string>('DB_NAME') || 'coachme';
        const ssl = configService.get<string>('DB_SSL') === 'true';

        logger.log(
          `[TrainerAthleteDatabaseModule] Connecting to database: ${host}:${port}/${database} as user: ${user}`,
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
              tableName: 'knex_migrations_trainer_athletes',
            },
          });

          logger.log('[TrainerAthleteDatabaseModule] Running migrations...');
          await db.migrate.latest();
          logger.log(
            '[TrainerAthleteDatabaseModule] Migrations completed successfully',
          );

          return db;
        } catch (error) {
          logger.error(
            '[TrainerAthleteDatabaseModule] Failed to connect to database or run migrations',
            error,
          );
          throw error;
        }
      },
      inject: [ConfigService],
    },
    {
      provide: TRAINER_ATHLETE_REPOSITORY_OUT_PORT,
      useFactory: (knex: Knex) => new TrainerAthleteDatabaseRepository(knex),
      inject: [TRAINER_ATHLETE_KNEX_CONNECTION],
    },
  ],
  exports: [TRAINER_ATHLETE_REPOSITORY_OUT_PORT],
})
export class TrainerAthleteDatabaseModule {}
