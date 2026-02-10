/**
 * Examples of different exercise types
 * This file serves as documentation and usage examples
 */

import { Exercise } from './exercise.entity';
import { WorkoutType } from './workout-type.enum';

/**
 * Example 1: Long run
 */
export const longRunExample: Exercise = new Exercise(
  'exercise-1',
  'trainer-123', // trainer who added this exercise
  'Bieg długi',
  'Spokojny bieg długodystansowy w strefie tlenowej',
  WorkoutType.RUNNING,
  {
    defaults: {
      distanceKm: 10,
      pace: '05:30',
      elevationMeters: 0,
    },
  },
  true, // isTemplate
  new Date(),
  new Date(),
);

/**
 * Example 2: Interval run
 */
export const intervalRunExample: Exercise = new Exercise(
  'exercise-2',
  'trainer-123',
  'Bieg interwałowy',
  'Trening interwałowy z okresami pracy i odpoczynku',
  WorkoutType.RUNNING,
  {
    defaults: {
      repetitions: 4,
      workDurationSeconds: 300,
      restDurationSeconds: 120,
      workPace: '04:00',
      restType: 'active',
    },
  },
  true,
  new Date(),
  new Date(),
);

/**
 * Example 3: Strength training - Squats
 */
export const squatExample: Exercise = new Exercise(
  'exercise-3',
  'trainer-123',
  'Przysiady',
  'Przysiady ze sztangą',
  WorkoutType.STRENGTH,
  {
    defaults: {
      sets: 3,
      repetitions: 10,
      weightKg: 0,
      restBetweenSetsSeconds: 120,
    },
  },
  true,
  new Date(),
  new Date(),
);

/**
 * Example 4: Cycling - Tempo ride
 */
export const tempoCyclingExample: Exercise = new Exercise(
  'exercise-4',
  'trainer-123',
  'Jazda tempowa',
  'Jazda na rowerze w stałym tempie',
  WorkoutType.CYCLING,
  {
    defaults: {
      distanceKm: 50,
      averagePowerWatts: 200,
      cadence: 90,
    },
  },
  true,
  new Date(),
  new Date(),
);

/**
 * Example 5: Swimming - Pool
 */
export const swimmingExample: Exercise = new Exercise(
  'exercise-5',
  'trainer-123',
  'Pływanie stylem dowolnym',
  'Trening pływacki w basenie',
  WorkoutType.SWIMMING,
  {
    defaults: {
      distanceMeters: 1000,
      laps: 40,
      restBetweenLapsSeconds: 10,
    },
  },
  true,
  new Date(),
  new Date(),
);

/**
 * Example usage in Workout (exercise instance in training plan)
 *
 * Trainer selects exercise and overrides parameters:
 */
export const workoutExample = {
  exerciseId: 'exercise-1', // reference to template
  parameters: {
    // Override default values from exercise
    distanceKm: 15, // instead of default 10km
    pace: '05:00', // instead of default 05:30
    elevationMeters: 200, // adds elevation
  },
};
