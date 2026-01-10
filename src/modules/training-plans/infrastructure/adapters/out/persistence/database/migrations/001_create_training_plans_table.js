/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists('training_plans')
    .createTable('training_plans', function (table) {
    table.uuid('id').primary();
    table.uuid('trainer_id').notNullable();
    table.uuid('athlete_id').notNullable();
    table.string('name').notNullable();
    table.text('description').nullable();
    table
      .enum('status', ['DRAFT', 'ACTIVE', 'COMPLETED', 'PAUSED'])
      .notNullable()
      .defaultTo('DRAFT');
    table.timestamp('start_date').nullable();
    table.timestamp('end_date').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indeksy
    table.index('trainer_id');
    table.index('athlete_id');
    table.index(['trainer_id', 'athlete_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('training_plans');
};
