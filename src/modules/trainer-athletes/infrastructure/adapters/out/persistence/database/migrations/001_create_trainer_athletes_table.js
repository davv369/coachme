/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists('trainer_athletes')
    .createTable('trainer_athletes', function (table) {
      table.uuid('id').primary();
      table.uuid('trainer_id').notNullable();
      table.uuid('athlete_id').notNullable();
      table
        .enum('status', ['ACTIVE', 'INACTIVE'])
        .notNullable()
        .defaultTo('ACTIVE');
      table.timestamp('start_date').notNullable().defaultTo(knex.fn.now());
      table.timestamp('end_date').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

      // Foreign keys
      table
        .foreign('trainer_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table
        .foreign('athlete_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      // Indexes
      table.index('trainer_id');
      table.index('athlete_id');
      table.index(['trainer_id', 'status']);
      table.index(['athlete_id', 'status']);

      // Note: We handle unique active relationships in application logic
      // Multiple inactive relationships are allowed for history tracking
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('trainer_athletes');
};
