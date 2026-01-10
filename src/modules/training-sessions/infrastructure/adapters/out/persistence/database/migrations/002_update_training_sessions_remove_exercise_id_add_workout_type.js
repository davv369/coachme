/**
 * Migration to update training_sessions table:
 * - Remove exercise_id column and foreign key
 * - Add workout_type enum column
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('training_sessions', function (table) {
    // Drop foreign key constraint first
    table.dropForeign('exercise_id');
    // Drop the exercise_id column
    table.dropColumn('exercise_id');
    // Add workout_type enum column
    table
      .enum('workout_type', [
        'RUNNING',
        'CYCLING',
        'SWIMMING',
        'STRENGTH',
        'HIKING',
        'RECOVERY',
      ])
      .notNullable()
      .defaultTo('RUNNING'); // Default value for existing rows
    // Add index for workout_type
    table.index('workout_type');
    table.index(['athlete_id', 'workout_type']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('training_sessions', function (table) {
    // Remove workout_type indexes
    table.dropIndex(['athlete_id', 'workout_type']);
    table.dropIndex('workout_type');
    // Drop workout_type column
    table.dropColumn('workout_type');
    // Add back exercise_id column
    table.uuid('exercise_id').notNullable();
    // Add back foreign key
    table
      .foreign('exercise_id')
      .references('id')
      .inTable('exercises')
      .onDelete('CASCADE');
  });
};
