import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import { WorkoutType } from './workout-type.enum';
import {
  WORKOUT_STEP_TYPES,
  WORKOUT_TYPE_DURATION_TYPES,
  WORKOUT_TYPE_TARGET_TYPES,
} from './workout-parameters.types';

const VALID_STEP_TYPES = new Set(WORKOUT_STEP_TYPES);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function validateIntensityAllowed(
  intensity: unknown,
  workoutType: WorkoutType,
  path: string,
  field: string,
): void {
  if (intensity === undefined || intensity === null) return;
  if (!isPlainObject(intensity) || typeof intensity.type !== 'string') return;
  const allowed = WORKOUT_TYPE_TARGET_TYPES[workoutType];
  if (!allowed.includes(intensity.type as (typeof allowed)[number])) {
    throw new DomainException(
      InternalErrorCode.VALIDATION_ERROR,
      `${path}: ${field} type "${intensity.type}" is not allowed for this workout type (allowed: ${allowed.join(', ')})`,
    );
  }
}

function validateStep(
  step: unknown,
  path: string,
  workoutType: WorkoutType,
): void {
  if (!isPlainObject(step)) {
    throw new DomainException(
      InternalErrorCode.VALIDATION_ERROR,
      `${path}: step must be an object`,
    );
  }
  const type = step.type;
  if (type !== 'repeat') {
    if (!VALID_STEP_TYPES.has(type as (typeof WORKOUT_STEP_TYPES)[number])) {
      throw new DomainException(
        InternalErrorCode.VALIDATION_ERROR,
        `${path}: invalid step type "${type}"`,
      );
    }
    if (!isPlainObject(step.duration)) {
      throw new DomainException(
        InternalErrorCode.VALIDATION_ERROR,
        `${path}: step must have duration object (type, minutes/seconds/meters/km etc.)`,
      );
    }
    const dur = step.duration as Record<string, unknown>;
    if (typeof dur.type !== 'string') {
      throw new DomainException(
        InternalErrorCode.VALIDATION_ERROR,
        `${path}: duration must have type (time, distance, reps, etc.)`,
      );
    }
    const allowedDur = WORKOUT_TYPE_DURATION_TYPES[workoutType];
    if (!allowedDur.includes(dur.type as (typeof allowedDur)[number])) {
      throw new DomainException(
        InternalErrorCode.VALIDATION_ERROR,
        `${path}: duration type "${dur.type}" is not allowed for this workout type (allowed: ${allowedDur.join(', ')})`,
      );
    }
    validateIntensityAllowed(step.intensity, workoutType, path, 'intensity');
    validateIntensityAllowed(
      step.secondaryIntensity,
      workoutType,
      path,
      'secondaryIntensity',
    );
    return;
  }
  if (typeof step.repeatCount !== 'number' || step.repeatCount < 1) {
    throw new DomainException(
      InternalErrorCode.VALIDATION_ERROR,
      `${path}: repeat step must have repeatCount (number >= 1)`,
    );
  }
  if (!Array.isArray(step.steps)) {
    throw new DomainException(
      InternalErrorCode.VALIDATION_ERROR,
      `${path}: repeat step must have steps array`,
    );
  }
  step.steps.forEach((s, i) =>
    validateStep(s, `${path}.steps[${i}]`, workoutType),
  );
}

export function validateStepsShape(
  steps: unknown,
  workoutType: WorkoutType,
): void {
  if (!Array.isArray(steps)) {
    throw new DomainException(
      InternalErrorCode.VALIDATION_ERROR,
      'parametersTemplate.defaults.steps must be an array',
    );
  }
  steps.forEach((step, i) => validateStep(step, `steps[${i}]`, workoutType));
}
