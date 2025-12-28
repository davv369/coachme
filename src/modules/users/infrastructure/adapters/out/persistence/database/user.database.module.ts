import { Logger } from '@common/logger/logger';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Knex, knex } from 'knex';
import * as path from 'path';

import { USER_REPOSITORY_OUT_PORT } from '../../../../../application/ports/out/user-repository.out-port';
import { UserDatabaseRepository } from './user.database.repository';

export const USER_KNEX_CONNECTION = 'UserConnection';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: USER_KNEX_CONNECTION,
      useFactory: async (configService: ConfigService): Promise<Knex> => {
        const logger = new Logger('UserDatabaseModule');
        const host = configService.get<string>('DB_HOST') || 'localhost';
        const port = configService.get<number>('DB_PORT') || 5433;
        const user = configService.get<string>('DB_USER') || 'postgres';
        const password = configService.get<string>('DB_PASSWORD') || 'postgres';
        const database = configService.get<string>('DB_NAME') || 'coachme';
        const ssl = configService.get<string>('DB_SSL') === 'true';

        logger.log(
          `[UserDatabaseModule] Connecting to database: ${host}:${port}/${database} as user: ${user}`,
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
              tableName: 'knex_migrations_users',
            },
          });

          logger.log('[UserDatabaseModule] Running migrations...');
          await db.migrate.latest();
          logger.log('[UserDatabaseModule] Migrations completed successfully');

          return db;
        } catch (error) {
          logger.error(
            '[UserDatabaseModule] Failed to connect to database or run migrations',
            error,
          );
          throw error;
        }
      },
      inject: [ConfigService],
    },
    {
      provide: USER_REPOSITORY_OUT_PORT,
      useFactory: (knex: Knex) => new UserDatabaseRepository(knex),
      inject: [USER_KNEX_CONNECTION],
    },
  ],
  exports: [USER_REPOSITORY_OUT_PORT],
})
export class UserDatabaseModule {}

