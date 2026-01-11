import { StravaToken } from '../../../domain/strava-token.entity';

export const STRAVA_IN_PORT = Symbol('STRAVA_IN_PORT');

export interface AuthorizeStravaCommand {
  userId: string;
}

export interface HandleStravaCallbackCommand {
  userId: string;
  code: string;
}

export interface SyncStravaActivitiesCommand {
  userId: string;
  after?: Date;
  before?: Date;
}

export interface SyncStravaActivityCommand {
  userId: string;
  activityId: string;
}

export interface DisconnectStravaCommand {
  userId: string;
}

export interface CheckStravaConnectionQuery {
  userId: string;
}

export interface StravaInPort {
  authorizeStrava(command: AuthorizeStravaCommand): Promise<string>; // Returns authorization URL
  handleCallback(command: HandleStravaCallbackCommand): Promise<StravaToken>;
  checkConnection(
    query: CheckStravaConnectionQuery,
  ): Promise<StravaToken | null>;
  syncActivities(command: SyncStravaActivitiesCommand): Promise<number>; // Returns count of synced activities
  syncActivity(command: SyncStravaActivityCommand): Promise<void>;
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
  disconnectStrava(command: DisconnectStravaCommand): Promise<void>;
}
