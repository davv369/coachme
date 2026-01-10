/**
 * Training plan status
 */
export enum TrainingPlanStatus {
  DRAFT = 'DRAFT', // Draft - trainer is still editing
  ACTIVE = 'ACTIVE', // Active - shared with athlete
  COMPLETED = 'COMPLETED', // Completed
  PAUSED = 'PAUSED', // Paused
}

/**
 * Entity representing a training plan
 * Plan can be edited over time - trainer adds new workouts
 */
export class TrainingPlan {
  constructor(
    public readonly id: string,
    public readonly trainerId: string, // Trainer who created the plan
    public readonly athleteId: string, // Athlete for whom the plan is created
    public readonly name: string, // Plan name (e.g., "Marathon preparation")
    public readonly description: string | null, // Plan description
    public readonly status: TrainingPlanStatus,
    public readonly startDate: Date | null, // Plan start date
    public readonly endDate: Date | null, // Plan end date (optional)
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
