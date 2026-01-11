/**
 * Entity representing a Strava activity
 * Used to map Strava activity data to our TrainingSession
 */
export class StravaActivity {
  constructor(
    public readonly id: string, // Strava activity ID
    public readonly athleteId: string, // Strava athlete ID
    public readonly name: string,
    public readonly type: string, // Strava activity type (Run, Ride, Swim, etc.)
    public readonly distance: number, // meters
    public readonly movingTime: number, // seconds
    public readonly elapsedTime: number, // seconds
    public readonly totalElevationGain: number, // meters
    public readonly startDate: Date,
    public readonly startDateLocal: Date,
    public readonly timezone: string,
    public readonly averageSpeed: number | null, // m/s
    public readonly maxSpeed: number | null, // m/s
    public readonly averageCadence: number | null,
    public readonly averageWatts: number | null,
    public readonly weightedAverageWatts: number | null,
    public readonly kilojoules: number | null,
    public readonly deviceWatts: boolean | null,
    public readonly hasHeartrate: boolean,
    public readonly averageHeartrate: number | null,
    public readonly maxHeartrate: number | null,
    public readonly calories: number | null,
    public readonly description: string | null,
    public readonly rawData: Record<string, any>, // Full Strava response
  ) {}
}
