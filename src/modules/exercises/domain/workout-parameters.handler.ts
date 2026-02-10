import { WorkoutType } from './workout-type.enum';

export interface WorkoutParametersHandler {
  readonly workoutType: WorkoutType;
  getAllowedKeys(): Set<string>;
  filter(params: Record<string, unknown>): Record<string, unknown>;
}

const BASE_KEYS = [
  'durationMinutes',
  'durationSeconds',
  'calories',
  'averageHeartRate',
  'maxHeartRate',
  'notes',
  'intervals',
  'steps',
] as const;

const WORKOUT_KEYS = {
  [WorkoutType.RUNNING]: [
    ...BASE_KEYS,
    'distanceKm',
    'pace',
    'elevationGainMeters',
    'cadence',
  ],
  [WorkoutType.CYCLING]: [
    ...BASE_KEYS,
    'distanceKm',
    'averageSpeedKmh',
    'maxSpeedKmh',
    'elevationGainMeters',
    'averagePowerWatts',
    'weightedAveragePowerWatts',
    'cadence',
    'kilojoules',
  ],
  [WorkoutType.SWIMMING]: [...BASE_KEYS, 'distanceMeters'],
  [WorkoutType.STRENGTH]: [
    ...BASE_KEYS,
    'repetitions',
    'sets',
    'weightKg',
    'restSeconds',
    'exerciseName',
  ],
  [WorkoutType.HIKING]: [
    ...BASE_KEYS,
    'distanceKm',
    'pace',
    'elevationGainMeters',
  ],
  [WorkoutType.RECOVERY]: [
    ...BASE_KEYS,
    'distanceKm',
    'pace',
    'elevationGainMeters',
  ],
} satisfies Record<WorkoutType, readonly string[]>;

const WORKOUT_ALLOWED_KEY_SETS: Record<WorkoutType, Set<string>> = {
  [WorkoutType.RUNNING]: new Set(WORKOUT_KEYS[WorkoutType.RUNNING]),
  [WorkoutType.CYCLING]: new Set(WORKOUT_KEYS[WorkoutType.CYCLING]),
  [WorkoutType.SWIMMING]: new Set(WORKOUT_KEYS[WorkoutType.SWIMMING]),
  [WorkoutType.STRENGTH]: new Set(WORKOUT_KEYS[WorkoutType.STRENGTH]),
  [WorkoutType.HIKING]: new Set(WORKOUT_KEYS[WorkoutType.HIKING]),
  [WorkoutType.RECOVERY]: new Set(WORKOUT_KEYS[WorkoutType.RECOVERY]),
};

function filterParams(
  params: Record<string, unknown>,
  allowedKeys: Set<string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(params)) {
    if (allowedKeys.has(key)) {
      result[key] = params[key];
    }
  }
  return result;
}

function createHandler(workoutType: WorkoutType): WorkoutParametersHandler {
  const allowedKeys = WORKOUT_ALLOWED_KEY_SETS[workoutType];
  return {
    workoutType,
    getAllowedKeys: () => allowedKeys,
    filter: (params) => filterParams(params, allowedKeys),
  };
}

const HANDLERS: Record<WorkoutType, WorkoutParametersHandler> = {
  [WorkoutType.RUNNING]: createHandler(WorkoutType.RUNNING),
  [WorkoutType.CYCLING]: createHandler(WorkoutType.CYCLING),
  [WorkoutType.SWIMMING]: createHandler(WorkoutType.SWIMMING),
  [WorkoutType.STRENGTH]: createHandler(WorkoutType.STRENGTH),
  [WorkoutType.HIKING]: createHandler(WorkoutType.HIKING),
  [WorkoutType.RECOVERY]: createHandler(WorkoutType.RECOVERY),
};

export function getWorkoutParametersHandler(
  workoutType: WorkoutType,
): WorkoutParametersHandler {
  return HANDLERS[workoutType];
}

/**
 * Filters defaults to allowed keys for the workout type. No schema – only steps/defaults.
 */
export function filterDefaultsForWorkoutType(
  workoutType: WorkoutType,
  defaults: Record<string, unknown>,
): Record<string, unknown> {
  const allowedKeys = getWorkoutParametersHandler(workoutType).getAllowedKeys();
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(defaults)) {
    if (allowedKeys.has(key)) result[key] = defaults[key];
  }
  return result;
}
