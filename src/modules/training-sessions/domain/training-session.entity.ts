import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

/**
 * Entity representing a training session (actual execution)
 * Training session is created by athlete when they perform a workout
 * Athlete has full freedom to choose workout type and parameters
 * Can be linked to a training plan (optional) for statistics purposes
 */
export class TrainingSession {
  constructor(
    public readonly id: string,
    /**
     * Athlete who performed the session
     */
    public readonly athleteId: string,
    /**
     * Type of workout performed
     */
    public readonly workoutType: WorkoutType,
    /**
     * Actual date when the session was performed
     */
    public readonly actualDate: Date,
    /**
     * Actual parameters/results from the session
     * Athlete has full freedom - no validation against exercise template
     * Example: { distanceKm: 10, pace: '05:30', elevationMeters: 250 }
     */
    public readonly actualParameters: Record<string, any>,
    /**
     * Athlete's notes about the session
     */
    public readonly notes: string | null,
    /**
     * Optional link to training plan (for statistics - to calculate plan completion %)
     * Not linked to specific workout - athlete can perform any exercise regardless of plan
     */
    public readonly trainingPlanId: string | null,
    /**
     * Strava activity ID if this session was synced from Strava
     * Used for deduplication and handling Strava webhook events (update/delete)
     */
    public readonly stravaActivityId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
