import { Inject, Injectable } from '@nestjs/common';
import {
  AuthorizeStravaRequest,
  HandleStravaCallbackRequest,
  SyncStravaActivitiesRequest,
  SyncStravaActivityRequest,
  DisconnectStravaRequest,
  CheckStravaConnectionRequest,
  StravaOutPort,
} from '../../../application/ports/out/strava.out-port';
import {
  STRAVA_IN_PORT,
  StravaInPort,
} from '@modules/strava/application/ports/in/strava.in-port';

@Injectable()
export class StravaInternalOutAdapter implements StravaOutPort {
  constructor(
    @Inject(STRAVA_IN_PORT)
    private readonly stravaInPort: StravaInPort,
  ) {}

  async authorizeStrava(request: AuthorizeStravaRequest): Promise<string> {
    return this.stravaInPort.authorizeStrava({
      userId: request.userId,
    });
  }

  async checkConnection(
    request: CheckStravaConnectionRequest,
  ): Promise<any | null> {
    return this.stravaInPort.checkConnection({
      userId: request.userId,
    });
  }

  async handleCallback(request: HandleStravaCallbackRequest): Promise<any> {
    return this.stravaInPort.handleCallback({
      userId: request.userId,
      code: request.code,
    });
  }

  async syncActivities(request: SyncStravaActivitiesRequest): Promise<number> {
    return this.stravaInPort.syncActivities({
      userId: request.userId,
      after: request.after,
      before: request.before,
    });
  }

  async syncActivity(request: SyncStravaActivityRequest): Promise<void> {
    return this.stravaInPort.syncActivity({
      userId: request.userId,
      activityId: request.activityId,
    });
  }

  async disconnectStrava(request: DisconnectStravaRequest): Promise<void> {
    return this.stravaInPort.disconnectStrava({
      userId: request.userId,
    });
  }

  async syncActivityByStravaAthleteId(
    stravaAthleteId: string,
    activityId: string,
  ): Promise<void> {
    return this.stravaInPort.syncActivityByStravaAthleteId(
      stravaAthleteId,
      activityId,
    );
  }

  async updateActivityByStravaAthleteId(
    stravaAthleteId: string,
    activityId: string,
  ): Promise<void> {
    return this.stravaInPort.updateActivityByStravaAthleteId(
      stravaAthleteId,
      activityId,
    );
  }

  async deleteActivityByStravaAthleteId(
    stravaAthleteId: string,
    activityId: string,
  ): Promise<void> {
    return this.stravaInPort.deleteActivityByStravaAthleteId(
      stravaAthleteId,
      activityId,
    );
  }
}
