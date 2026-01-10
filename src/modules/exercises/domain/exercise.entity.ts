import { WorkoutType } from './workout-type.enum';

/**
 * Template defining available parameters for an exercise
 */
export interface ExerciseParametersTemplate {
  /**
   * Schema defining available parameters
   * Key = parameter name, value = parameter definition
   */
  schema: {
    [key: string]: {
      type: 'number' | 'string' | 'boolean';
      label: string; // Display name (e.g., "Distance (km)")
      unit?: string; // Unit (e.g., "km", "min", "kg")
      min?: number; // Minimum value
      max?: number; // Maximum value
      required?: boolean; // Whether the parameter is required
      default?: any; // Default value
    };
  };
  /**
   * Default parameter values
   */
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
