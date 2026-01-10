/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists('exercises')
    .createTable('exercises', function (table) {
      table.uuid('id').primary();
      table.uuid('trainer_id').nullable(); // null = globalne/systemowe
      table.string('name').notNullable();
      table.text('description').notNullable();
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
      table.jsonb('parameters_template').notNullable(); // Schema + defaults
      table.boolean('is_template').notNullable().defaultTo(true);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

      // Indeksy
      table.index('trainer_id');
      table.index('workout_type');
      table.index(['trainer_id', 'workout_type']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('exercises');
};
