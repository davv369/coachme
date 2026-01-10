import { TrainerAthleteStatus } from './trainer-athlete-status.enum';

/**
 * Entity representing a relationship between a trainer and an athlete
 * One trainer can have many athletes (1:N relationship)
 */
export class TrainerAthlete {
  constructor(
    public readonly id: string,
    /**
     * Trainer (user with TRAINER role)
     */
    public readonly trainerId: string,
    /**
     * Athlete (user with ATHLETE role)
     */
    public readonly athleteId: string,
    /**
     * Status of the relationship
     */
    public readonly status: TrainerAthleteStatus,
    /**
     * When the relationship started
     */
    public readonly startDate: Date,
    /**
     * When the relationship ended (null if still active)
     */
    public readonly endDate: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
