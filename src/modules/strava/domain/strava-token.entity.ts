/**
 * Entity representing Strava OAuth tokens for an athlete
 * Used to authenticate API requests to Strava
 */
export class StravaToken {
  constructor(
    public readonly id: string,
    /**
     * User (athlete) ID in our system
     */
    public readonly userId: string,
    /**
     * Strava athlete ID
     */
    public readonly stravaAthleteId: string,
    /**
     * Encrypted access token
     */
    public readonly accessToken: string,
    /**
     * Encrypted refresh token
     */
    public readonly refreshToken: string,
    /**
     * Token expiration timestamp
     */
    public readonly expiresAt: Date,
    /**
     * When the token was created/refreshed
     */
    public readonly updatedAt: Date,
    public readonly createdAt: Date,
  ) {}
}
