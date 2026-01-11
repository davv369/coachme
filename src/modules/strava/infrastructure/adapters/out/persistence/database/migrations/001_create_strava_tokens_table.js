/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists('strava_tokens')
    .createTable('strava_tokens', function (table) {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().unique();
      table.bigInteger('strava_athlete_id').notNullable();
      table.text('access_token').notNullable(); // Encrypted
      table.text('refresh_token').notNullable(); // Encrypted
      table.timestamp('expires_at').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

      // Foreign key
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      // Indexes
      table.index('user_id');
      table.index('strava_athlete_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('strava_tokens');
};
