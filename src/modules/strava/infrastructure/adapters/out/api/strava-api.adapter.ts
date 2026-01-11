import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExchangeCodeForTokenRequest,
  RefreshTokenRequest,
  GetAthleteRequest,
  GetActivitiesRequest,
  GetActivityRequest,
  StravaTokenResponse,
  StravaApiOutPort,
} from '../../../../application/ports/out/strava-api.out-port';
import { StravaActivity } from '../../../../domain/strava-activity.entity';

@Injectable()
export class StravaApiAdapter implements StravaApiOutPort {
  private readonly baseUrl = 'https://www.strava.com/api/v3';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = configService.get<string>('STRAVA_CLIENT_ID') || '';
    this.clientSecret = configService.get<string>('STRAVA_CLIENT_SECRET') || '';
    this.redirectUri =
      configService.get<string>('STRAVA_REDIRECT_URI') ||
      'http://localhost:3000/api/strava/callback';
  }

  async exchangeCodeForToken(
    request: ExchangeCodeForTokenRequest,
  ): Promise<StravaTokenResponse> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: request.code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to exchange code for token';
      try {
        const errorData = await response.json();
        if (errorData.errors && errorData.errors.length > 0) {
          const firstError = errorData.errors[0];
          if (firstError.code === 'invalid' && firstError.field === 'code') {
            errorMessage =
              'Authorization code is invalid or has expired. Please try connecting your Strava account again.';
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } else {
          errorMessage = errorData.message || errorMessage;
        }
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async refreshToken(
    request: RefreshTokenRequest,
  ): Promise<StravaTokenResponse> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: request.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    return response.json();
  }

  async getAthlete(request: GetAthleteRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/athlete`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${request.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get athlete: ${error}`);
    }

    return response.json();
  }

  async getActivities(
    request: GetActivitiesRequest,
  ): Promise<StravaActivity[]> {
    const params = new URLSearchParams();
    if (request.before) params.append('before', request.before.toString());
    if (request.after) params.append('after', request.after.toString());
    if (request.page) params.append('page', request.page.toString());
    if (request.perPage) params.append('per_page', request.perPage.toString());

    const url = `${this.baseUrl}/athlete/activities?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${request.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get activities: ${error}`);
    }

    const activities = await response.json();
    return activities.map((activity: any) =>
      this.mapToStravaActivity(activity),
    );
  }

  async getActivity(request: GetActivityRequest): Promise<StravaActivity> {
    const response = await fetch(
      `${this.baseUrl}/activities/${request.activityId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get activity: ${error}`);
    }

    const activity = await response.json();
    return this.mapToStravaActivity(activity);
  }

  private mapToStravaActivity(activity: any): StravaActivity {
    return new StravaActivity(
      activity.id.toString(),
      activity.athlete.id.toString(),
      activity.name || '',
      activity.type || '',
      activity.distance || 0,
      activity.moving_time || 0,
      activity.elapsed_time || 0,
      activity.total_elevation_gain || 0,
      new Date(activity.start_date),
      new Date(activity.start_date_local),
      activity.timezone || '',
      activity.average_speed || null,
      activity.max_speed || null,
      activity.average_cadence || null,
      activity.average_watts || null,
      activity.weighted_average_watts || null,
      activity.kilojoules || null,
      activity.device_watts || null,
      activity.has_heartrate || false,
      activity.average_heartrate || null,
      activity.max_heartrate || null,
      activity.calories || null,
      activity.description || null,
      activity, // Full raw data
    );
  }
}
