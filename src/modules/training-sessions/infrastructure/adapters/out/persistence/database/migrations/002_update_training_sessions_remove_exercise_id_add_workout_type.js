/**
 * Migration 002 - DEPRECATED
 * This migration is no longer needed as workout_type is already included
 * in migration 001_create_training_sessions_table.js
 * 
 * Keeping this file for migration history, but making it a no-op
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // No-op: workout_type and all indexes are already in migration 001
  return Promise.resolve();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // No-op: nothing to rollback
  return Promise.resolve();
};
