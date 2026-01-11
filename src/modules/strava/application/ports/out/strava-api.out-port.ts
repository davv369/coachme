import { StravaActivity } from '../../../domain/strava-activity.entity';

export const STRAVA_API_OUT_PORT = Symbol('STRAVA_API_OUT_PORT');

export interface ExchangeCodeForTokenRequest {
  code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface GetAthleteRequest {
  accessToken: string;
}

export interface GetActivitiesRequest {
  accessToken: string;
  before?: number; // Unix timestamp
  after?: number; // Unix timestamp
  page?: number;
  perPage?: number;
}

export interface GetActivityRequest {
  accessToken: string;
  activityId: string;
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp
  athlete: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
  };
}

export interface StravaApiOutPort {
  exchangeCodeForToken(
    request: ExchangeCodeForTokenRequest,
  ): Promise<StravaTokenResponse>;
  refreshToken(request: RefreshTokenRequest): Promise<StravaTokenResponse>;
  getAthlete(request: GetAthleteRequest): Promise<any>;
  getActivities(request: GetActivitiesRequest): Promise<StravaActivity[]>;
  getActivity(request: GetActivityRequest): Promise<StravaActivity>;
}
