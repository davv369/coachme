/**
 * Entity representing a single workout in a plan
 * Workout is always part of TrainingPlan - cannot exist standalone
 */
export class Workout {
  constructor(
    public readonly id: string,
    public readonly trainingPlanId: string, // Always linked to a plan
    public readonly exerciseId: string, // Reference to Exercise (template)
    /**
     * Parameters customized per athlete
     * Override default values from Exercise.parametersTemplate.defaults
     */
    public readonly parameters: Record<string, any>,
    /**
     * Scheduled workout date
     */
    public readonly scheduledDate: Date,
    /**
     * Order in plan (optional, for sorting)
     */
    public readonly order: number,
    /**
     * Trainer notes for this workout (optional)
     */
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
