/**
 * Examples of TrainingPlan and Workout usage
 * Shows how trainer creates plan and adds workouts
 */

import { TrainingPlan, TrainingPlanStatus } from './training-plan.entity';
import { Workout } from './workout.entity';

/**
 * Example: Trainer creates plan for athlete
 */
export const trainingPlanExample: TrainingPlan = new TrainingPlan(
  'plan-1',
  'trainer-123',
  'athlete-456',
  'Przygotowanie do maratonu',
  'Plan przygotowawczy na 12 tygodni przed maratonem',
  TrainingPlanStatus.DRAFT, // First in draft status
  new Date('2026-01-15'),
  new Date('2026-04-15'),
  new Date('2026-01-10'),
  new Date('2026-01-10'),
);

/**
 * Example: Trainer adds first workouts to plan
 * (Day 1 - creates plan for a week ahead)
 */
export const initialWorkouts: Workout[] = [
  new Workout(
    'workout-1',
    'plan-1',
    'exercise-1', // "Long run" - selects from exercises list
    {
      // Parameters customized per athlete
      distanceKm: 12, // instead of default 10km
      pace: '05:15', // instead of default 05:30
      elevationMeters: 50,
    },
    new Date('2026-01-15'), // Scheduled for January 15
    1, // Order
    'Spokojny bieg regeneracyjny',
    new Date('2026-01-10'),
    new Date('2026-01-10'),
  ),
  new Workout(
    'workout-2',
    'plan-1',
    'exercise-2', // "Interval run"
    {
      repetitions: 5, // instead of default 4
      workDurationSeconds: 300,
      restDurationSeconds: 120,
      workPace: '03:50', // faster pace for this athlete
      restType: 'active',
    },
    new Date('2026-01-17'),
    2,
    null,
    new Date('2026-01-10'),
    new Date('2026-01-10'),
  ),
  new Workout(
    'workout-3',
    'plan-1',
    'exercise-1', // Again "Long run" - can reuse same exercise
    {
      distanceKm: 15, // Different parameters than workout-1
      pace: '05:00',
      elevationMeters: 100,
    },
    new Date('2026-01-19'),
    3,
    null,
    new Date('2026-01-10'),
    new Date('2026-01-10'),
  ),
];

/**
 * Example: After a few days trainer adds more workouts
 * (Day 5 - extends plan with more days)
 */
export const additionalWorkouts: Workout[] = [
  new Workout(
    'workout-4',
    'plan-1', // Same plan!
    'exercise-2', // Interval again
    {
      repetitions: 6, // Increases intensity
      workDurationSeconds: 300,
      restDurationSeconds: 120,
      workPace: '03:45', // Even faster pace
      restType: 'active',
    },
    new Date('2026-01-22'), // New day
    4,
    'Progression - more repetitions',
    new Date('2026-01-15'), // Created later
    new Date('2026-01-15'),
  ),
  new Workout(
    'workout-5',
    'plan-1',
    'exercise-4', // "Cycling" - adds variety
    {
      distanceKm: 60,
      averagePowerWatts: 220,
      cadence: 90,
    },
    new Date('2026-01-24'),
    5,
    'Cross-training',
    new Date('2026-01-15'),
    new Date('2026-01-15'),
  ),
];

/**
 * Example: Trainer workflow
 *
 * 1. Trainer creates Exercise (template):
 *    - "Long run" with default parameters
 *
 * 2. Trainer creates TrainingPlan for athlete:
 *    - Status: DRAFT
 *    - Adds first workouts (week ahead)
 *
 * 3. Trainer shares plan:
 *    - Changes status to ACTIVE
 *    - Athlete sees plan
 *
 * 4. Trainer extends plan:
 *    - Adds more workouts (after few days)
 *    - Plan is editable over time
 *
 * 5. Plan can be:
 *    - PAUSED (paused)
 *    - COMPLETED (completed)
 */
