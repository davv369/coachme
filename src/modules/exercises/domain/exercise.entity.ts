import { WorkoutType } from './workout-type.enum';

/**
 * Exercise parameters: only defaults (e.g. steps). No schema – FE knows structure per workoutType.
 */
export interface ExerciseParametersTemplate {
  defaults: Record<string, any>;
}

/**
 * Entity representing an exercise template
 */
export class Exercise {
  constructor(
    public readonly id: string,
    public readonly trainerId: string | null, // null = global/system exercise
    public readonly name: string,
    public readonly description: string,
    public readonly workoutType: WorkoutType,
    public readonly parametersTemplate: ExerciseParametersTemplate,
    public readonly isTemplate: boolean, // whether this is a reusable template
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
