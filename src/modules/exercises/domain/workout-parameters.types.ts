import { WorkoutType } from './workout-type.enum';

/**
 * Typed parameter shapes per WorkoutType.
 * Keep in sync with WORKOUT_KEYS in workout-parameters.handler.ts (allowed keys at runtime).
 */

export interface BaseWorkoutParameters {
  durationMinutes?: number;
  durationSeconds?: number;
  calories?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  notes?: string;
  intervals?: Interval[];
  steps?: WorkoutStep[];
}

export interface Interval {
  workSeconds?: number;
  workMinutes?: number;
  workDistanceMeters?: number;
  workDistanceKm?: number;
  targetPace?: string;
  restSeconds?: number;
  restMinutes?: number;
  restPace?: string;
  note?: string;
}

export type WorkoutStep =
  | {
      type: WorkoutStepType;
      duration: WorkoutDuration;
      intensity?: WorkoutIntensity;
      secondaryIntensity?: WorkoutIntensity;
      strokeType?: SwimStrokeType;
      drillType?: SwimDrillType;
      equipment?: SwimEquipment[];
      poolSize?: SwimPoolSize;
      note?: string;
    }
  | {
      type: 'repeat';
      repeatCount: number;
      steps: WorkoutStep[];
      note?: string;
    };

export const WORKOUT_STEP_TYPES = [
  'warmup',
  'run',
  'exercise',
  'hike',
  'swim',
  'recovery',
  'rest',
  'cooldown',
  'other',
] as const;

export type WorkoutStepType = (typeof WORKOUT_STEP_TYPES)[number];

/**
 * Primary step type per workout type – the one that describes the main activity for that sport.
 */
export const WORKOUT_TYPE_PRIMARY_STEP: Record<WorkoutType, WorkoutStepType> = {
  [WorkoutType.RUNNING]: 'run',
  [WorkoutType.SWIMMING]: 'swim',
  [WorkoutType.STRENGTH]: 'exercise',
  [WorkoutType.CYCLING]: 'exercise',
  [WorkoutType.HIKING]: 'hike',
  [WorkoutType.RECOVERY]: 'recovery',
};

export type WorkoutDuration =
  | { type: 'time'; seconds?: number; minutes?: number }
  | { type: 'distance'; meters?: number; km?: number }
  | { type: 'lapButton' }
  | { type: 'calories'; calories: number }
  | { type: 'heartRate'; bpm: number }
  | { type: 'reps'; reps: number };

export type WorkoutIntensity =
  | { type: 'none' }
  | { type: 'pace'; pace: string }
  | { type: 'speed'; speed: number }
  | { type: 'cadence'; spm: number }
  | { type: 'heartRateZone'; zone: number }
  | { type: 'customHeartRate'; minBpm: number; maxBpm: number }
  | { type: 'powerZone'; zone: number }
  | { type: 'customPower'; minWatts: number; maxWatts: number };

export type DurationType = WorkoutDuration['type'];
export type TargetType = WorkoutIntensity['type'];

/**
 * Allowed duration types per WorkoutType (time, distance, reps, …).
 * FE uses this to show the right duration inputs for the selected sport.
 */
export const WORKOUT_TYPE_DURATION_TYPES: Record<
  WorkoutType,
  readonly DurationType[]
> = {
  [WorkoutType.RUNNING]: ['time', 'distance'],
  [WorkoutType.CYCLING]: ['time', 'distance'],
  [WorkoutType.SWIMMING]: ['time', 'distance'],
  [WorkoutType.STRENGTH]: ['time', 'reps'],
  [WorkoutType.HIKING]: ['time', 'distance'],
  [WorkoutType.RECOVERY]: ['time', 'distance'],
};

/**
 * Allowed target/intensity types per WorkoutType (pace, powerZone, heartRateZone, …).
 * FE uses this to show the right intensity/target inputs for the selected sport.
 */
export const WORKOUT_TYPE_TARGET_TYPES: Record<
  WorkoutType,
  readonly TargetType[]
> = {
  [WorkoutType.RUNNING]: [
    'none',
    'pace',
    'heartRateZone',
    'customHeartRate',
    'cadence',
  ],
  [WorkoutType.CYCLING]: [
    'none',
    'powerZone',
    'customPower',
    'cadence',
    'heartRateZone',
  ],
  [WorkoutType.SWIMMING]: ['none', 'pace'],
  [WorkoutType.STRENGTH]: ['none'],
  [WorkoutType.HIKING]: ['none', 'pace', 'heartRateZone'],
  [WorkoutType.RECOVERY]: ['none', 'pace', 'heartRateZone'],
};

export type SwimStrokeType =
  | 'any'
  | 'freestyle'
  | 'backstroke'
  | 'breaststroke'
  | 'butterfly'
  | 'drill'
  | 'mixed'
  | 'choice'
  | 'individualMedley'
  | 'individualMedleyByRound'
  | 'reverseIndividualMedleyByRound';

export type SwimDrillType = 'drill' | 'kick' | 'pull';

export type SwimEquipment =
  | 'fins'
  | 'kickboard'
  | 'paddles'
  | 'pullBuoy'
  | 'snorkel';

export type SwimPoolSize =
  | { type: 'meters'; value: number }
  | { type: 'yards'; value: number }
  | { type: 'custom'; value: number }
  | { type: 'unspecified' };

export interface RunningParameters extends BaseWorkoutParameters {
  distanceKm?: number | string;
  pace?: string;
  elevationGainMeters?: number;
  cadence?: number;
}

export interface CyclingParameters extends BaseWorkoutParameters {
  distanceKm?: number | string;
  averageSpeedKmh?: number | string;
  maxSpeedKmh?: number | string;
  elevationGainMeters?: number;
  averagePowerWatts?: number;
  weightedAveragePowerWatts?: number;
  cadence?: number;
  kilojoules?: number;
}

export interface SwimmingParameters extends BaseWorkoutParameters {
  distanceMeters?: number;
}

export interface StrengthParameters extends BaseWorkoutParameters {
  repetitions?: number;
  sets?: number;
  weightKg?: number;
  restSeconds?: number;
  exerciseName?: string;
}

export interface HikingParameters extends BaseWorkoutParameters {
  distanceKm?: number | string;
  pace?: string;
  elevationGainMeters?: number;
}

export interface RecoveryParameters extends BaseWorkoutParameters {
  distanceKm?: number | string;
  pace?: string;
  elevationGainMeters?: number;
}

export type WorkoutTypeParameters = {
  [WorkoutType.RUNNING]: RunningParameters;
  [WorkoutType.CYCLING]: CyclingParameters;
  [WorkoutType.SWIMMING]: SwimmingParameters;
  [WorkoutType.STRENGTH]: StrengthParameters;
  [WorkoutType.HIKING]: HikingParameters;
  [WorkoutType.RECOVERY]: RecoveryParameters;
};

export type AnyWorkoutParameters =
  | RunningParameters
  | CyclingParameters
  | SwimmingParameters
  | StrengthParameters
  | HikingParameters
  | RecoveryParameters;

export type ParametersFor<T extends WorkoutType> = WorkoutTypeParameters[T];

/**
 * Type-safe view of defaults for a given WorkoutType.
 * Use after validation/filtering (e.g. filterDefaultsForWorkoutType).
 * At runtime returns the same object; TypeScript narrows the type based on T.
 */
export function asTypedParameters<T extends WorkoutType>(
  _workoutType: T,
  defaults: Record<string, unknown>,
): ParametersFor<T> {
  return defaults as ParametersFor<T>;
}
