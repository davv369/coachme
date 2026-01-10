/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists('training_sessions')
    .createTable('training_sessions', function (table) {
      table.uuid('id').primary();
      table.uuid('athlete_id').notNullable();
      table
        .enum('workout_type', [
          'RUNNING',
          'CYCLING',
          'SWIMMING',
          'STRENGTH',
          'HIKING',
          'RECOVERY',
        ])
        .notNullable();
      table.timestamp('actual_date').notNullable();
      table.jsonb('actual_parameters').notNullable();
      table.text('notes').nullable();
      table.uuid('training_plan_id').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

      // Foreign keys
      table
        .foreign('athlete_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table
        .foreign('training_plan_id')
        .references('id')
        .inTable('training_plans')
        .onDelete('SET NULL');

      // Indexes
      table.index('athlete_id');
      table.index('actual_date');
      table.index('workout_type');
      table.index('training_plan_id');
      table.index(['athlete_id', 'actual_date']);
      table.index(['athlete_id', 'training_plan_id']);
      table.index(['athlete_id', 'workout_type']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('training_sessions');
};
