import type { Knex } from 'knex';
import * as path from 'path';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'coachme',
    },
    migrations: {
      directory: path.join(
        __dirname,
        'modules/users/infrastructure/adapters/out/persistence/database/migrations',
      ),
      tableName: 'knex_migrations_users',
    },
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5433'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    migrations: {
      directory: path.join(
        __dirname,
        'modules/users/infrastructure/adapters/out/persistence/database/migrations',
      ),
      tableName: 'knex_migrations_users',
    },
  },
};

export default config;
