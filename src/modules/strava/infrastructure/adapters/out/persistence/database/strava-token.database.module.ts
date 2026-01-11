import { Logger } from '@common/logger/logger';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Knex, knex } from 'knex';
import * as path from 'path';

import { STRAVA_TOKEN_REPOSITORY_OUT_PORT } from '../../../../../application/ports/out/strava-token-repository.out-port';
import { StravaTokenDatabaseRepository } from './strava-token.database.repository';

export const STRAVA_TOKEN_KNEX_CONNECTION = 'StravaTokenConnection';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STRAVA_TOKEN_KNEX_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<Knex> => {
        const logger = new Logger('StravaTokenDatabaseModule');
        const host = configService.get<string>('DB_HOST') || 'localhost';
        const port = configService.get<number>('DB_PORT') || 5433;
        const user = configService.get<string>('DB_USER') || 'postgres';
        const password = configService.get<string>('DB_PASSWORD') || 'postgres';
        const database = configService.get<string>('DB_NAME') || 'coachme';
        const ssl = configService.get<string>('DB_SSL') === 'true';

        logger.log(
          `[StravaTokenDatabaseModule] Connecting to database: ${host}:${port}/${database} as user: ${user}`,
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
              tableName: 'knex_migrations_strava_tokens',
            },
          });

          logger.log('[StravaTokenDatabaseModule] Running migrations...');
          await db.migrate.latest();
          logger.log(
            '[StravaTokenDatabaseModule] Migrations completed successfully',
          );

          return db;
        } catch (error) {
          logger.error(
            '[StravaTokenDatabaseModule] Failed to connect to database or run migrations',
            error,
          );
          throw error;
        }
      },
      inject: [ConfigService],
    },
    {
      provide: STRAVA_TOKEN_REPOSITORY_OUT_PORT,
      useFactory: (knex: Knex) => new StravaTokenDatabaseRepository(knex),
      inject: [STRAVA_TOKEN_KNEX_CONNECTION],
    },
  ],
  exports: [STRAVA_TOKEN_REPOSITORY_OUT_PORT],
})
export class StravaTokenDatabaseModule {}
