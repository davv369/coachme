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
    schema: {
      distanceKm: {
        type: 'number',
        label: 'Dystans',
        unit: 'km',
        min: 1,
        max: 50,
        required: true,
        default: 10,
      },
      pace: {
        type: 'string',
        label: 'Tempo',
        unit: 'min/km',
        required: true,
        default: '05:30',
      },
      elevationMeters: {
        type: 'number',
        label: 'Przewyższenie',
        unit: 'm',
        min: 0,
        required: false,
        default: 0,
      },
    },
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
    schema: {
      repetitions: {
        type: 'number',
        label: 'Liczba powtórzeń',
        unit: 'x',
        min: 1,
        max: 20,
        required: true,
        default: 4,
      },
      workDurationSeconds: {
        type: 'number',
        label: 'Czas pracy',
        unit: 's',
        min: 10,
        max: 3600,
        required: true,
        default: 300, // 5 minutes
      },
      restDurationSeconds: {
        type: 'number',
        label: 'Czas odpoczynku',
        unit: 's',
        min: 10,
        max: 1800,
        required: true,
        default: 120, // 2 minutes
      },
      workPace: {
        type: 'string',
        label: 'Tempo pracy',
        unit: 'min/km',
        required: true,
        default: '04:00',
      },
      restType: {
        type: 'string',
        label: 'Typ odpoczynku',
        required: false,
        default: 'active', // 'active' or 'passive'
      },
    },
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
    schema: {
      sets: {
        type: 'number',
        label: 'Liczba serii',
        unit: 'x',
        min: 1,
        max: 10,
        required: true,
        default: 3,
      },
      repetitions: {
        type: 'number',
        label: 'Powtórzenia w serii',
        unit: 'x',
        min: 1,
        max: 50,
        required: true,
        default: 10,
      },
      weightKg: {
        type: 'number',
        label: 'Ciężar',
        unit: 'kg',
        min: 0,
        max: 500,
        required: false,
        default: 0,
      },
      restBetweenSetsSeconds: {
        type: 'number',
        label: 'Odpoczynek między seriami',
        unit: 's',
        min: 0,
        max: 600,
        required: false,
        default: 120,
      },
    },
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
    schema: {
      distanceKm: {
        type: 'number',
        label: 'Dystans',
        unit: 'km',
        min: 1,
        max: 200,
        required: true,
        default: 50,
      },
      averagePowerWatts: {
        type: 'number',
        label: 'Średnia moc',
        unit: 'W',
        min: 50,
        max: 500,
        required: false,
        default: 200,
      },
      cadence: {
        type: 'number',
        label: 'Kadencja',
        unit: 'rpm',
        min: 50,
        max: 120,
        required: false,
        default: 90,
      },
    },
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
    schema: {
      distanceMeters: {
        type: 'number',
        label: 'Dystans',
        unit: 'm',
        min: 25,
        max: 5000,
        required: true,
        default: 1000,
      },
      laps: {
        type: 'number',
        label: 'Liczba długości basenu',
        unit: 'x',
        min: 1,
        max: 200,
        required: false,
        default: 40, // for 25m pool
      },
      restBetweenLapsSeconds: {
        type: 'number',
        label: 'Odpoczynek między długościami',
        unit: 's',
        min: 0,
        max: 300,
        required: false,
        default: 10,
      },
    },
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
