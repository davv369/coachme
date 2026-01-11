import { StravaToken } from '../../../domain/strava-token.entity';

export const STRAVA_TOKEN_REPOSITORY_OUT_PORT = Symbol(
  'STRAVA_TOKEN_REPOSITORY_OUT_PORT',
);

export interface CreateStravaTokenRequest {
  userId: string;
  stravaAthleteId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface UpdateStravaTokenRequest {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface FindStravaTokenByUserIdRequest {
  userId: string;
}

export interface FindStravaTokenByStravaAthleteIdRequest {
  stravaAthleteId: string;
}

export interface DeleteStravaTokenRequest {
  userId: string;
}

export interface StravaTokenRepositoryOutPort {
  create(request: CreateStravaTokenRequest): Promise<StravaToken>;
  update(request: UpdateStravaTokenRequest): Promise<StravaToken>;
  findByUserId(
    request: FindStravaTokenByUserIdRequest,
  ): Promise<StravaToken | null>;
  findByStravaAthleteId(
    request: FindStravaTokenByStravaAthleteIdRequest,
  ): Promise<StravaToken | null>;
  delete(request: DeleteStravaTokenRequest): Promise<void>;
}
