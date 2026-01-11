import { StravaToken } from '@modules/strava/domain/strava-token.entity';

export const STRAVA_OUT_PORT = Symbol('STRAVA_OUT_PORT');

export interface AuthorizeStravaRequest {
  userId: string;
}

export interface HandleStravaCallbackRequest {
  userId: string;
  code: string;
}

export interface SyncStravaActivitiesRequest {
  userId: string;
  after?: Date;
  before?: Date;
}

export interface SyncStravaActivityRequest {
  userId: string;
  activityId: string;
}

export interface DisconnectStravaRequest {
  userId: string;
}

export interface CheckStravaConnectionRequest {
  userId: string;
}

export interface StravaOutPort {
  authorizeStrava(request: AuthorizeStravaRequest): Promise<string>;
  handleCallback(request: HandleStravaCallbackRequest): Promise<StravaToken>;
  checkConnection(request: CheckStravaConnectionRequest): Promise<any | null>;
  syncActivities(request: SyncStravaActivitiesRequest): Promise<number>;
  syncActivity(request: SyncStravaActivityRequest): Promise<void>;
  syncActivityByStravaAthleteId(
    stravaAthleteId: string,
    activityId: string,
  ): Promise<void>;
  updateActivityByStravaAthleteId(
    stravaAthleteId: string,
    activityId: string,
  ): Promise<void>;
  deleteActivityByStravaAthleteId(
    stravaAthleteId: string,
    activityId: string,
  ): Promise<void>;
  disconnectStrava(request: DisconnectStravaRequest): Promise<void>;
}
