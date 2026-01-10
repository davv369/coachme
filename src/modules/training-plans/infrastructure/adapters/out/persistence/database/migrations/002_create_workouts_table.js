/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists('workouts')
    .createTable('workouts', function (table) {
    table.uuid('id').primary();
    table.uuid('training_plan_id').notNullable();
    table.uuid('exercise_id').notNullable();
    table.jsonb('parameters').notNullable(); // Parametry dostosowane per zawodnik
    table.timestamp('scheduled_date').notNullable();
    table.integer('order').notNullable().defaultTo(1);
    table.text('notes').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Foreign keys
    table
      .foreign('training_plan_id')
      .references('id')
      .inTable('training_plans')
      .onDelete('CASCADE');
    table
      .foreign('exercise_id')
      .references('id')
      .inTable('exercises')
      .onDelete('RESTRICT');

    // Indeksy
    table.index('training_plan_id');
    table.index('exercise_id');
    table.index(['training_plan_id', 'scheduled_date']);
    table.index(['training_plan_id', 'order']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('workouts');
};
