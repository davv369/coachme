import { Injectable } from '@nestjs/common';
import { StravaToken } from '../../../../../domain/strava-token.entity';
import {
  CreateStravaTokenRequest,
  UpdateStravaTokenRequest,
  FindStravaTokenByUserIdRequest,
  FindStravaTokenByStravaAthleteIdRequest,
  DeleteStravaTokenRequest,
  StravaTokenRepositoryOutPort,
} from '../../../../../application/ports/out/strava-token-repository.out-port';
import { Knex } from 'knex';
import { randomUUID } from 'crypto';

interface StravaTokenRow {
  id: string;
  user_id: string;
  strava_athlete_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class StravaTokenDatabaseRepository implements StravaTokenRepositoryOutPort {
  private readonly tableName = 'strava_tokens';

  constructor(private readonly knex: Knex) {}

  async create(request: CreateStravaTokenRequest): Promise<StravaToken> {
    const now = new Date();
    const id = randomUUID();

    const [row] = await this.knex<StravaTokenRow>(this.tableName)
      .insert({
        id,
        user_id: request.userId,
        strava_athlete_id: request.stravaAthleteId.toString(),
        access_token: request.accessToken, // TODO: Encrypt
        refresh_token: request.refreshToken, // TODO: Encrypt
        expires_at: request.expiresAt,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return this.mapToStravaToken(row);
  }

  async update(request: UpdateStravaTokenRequest): Promise<StravaToken> {
    const now = new Date();

    const [row] = await this.knex<StravaTokenRow>(this.tableName)
      .where({ id: request.id })
      .update({
        access_token: request.accessToken, // TODO: Encrypt
        refresh_token: request.refreshToken, // TODO: Encrypt
        expires_at: request.expiresAt,
        updated_at: now,
      })
      .returning('*');

    if (!row) {
      throw new Error('Strava token not found');
    }

    return this.mapToStravaToken(row);
  }

  async findByUserId(
    request: FindStravaTokenByUserIdRequest,
  ): Promise<StravaToken | null> {
    const row = await this.knex<StravaTokenRow>(this.tableName)
      .where({ user_id: request.userId })
      .first();

    return row ? this.mapToStravaToken(row) : null;
  }

  async findByStravaAthleteId(
    request: FindStravaTokenByStravaAthleteIdRequest,
  ): Promise<StravaToken | null> {
    const row = await this.knex<StravaTokenRow>(this.tableName)
      .where({ strava_athlete_id: request.stravaAthleteId.toString() })
      .first();

    return row ? this.mapToStravaToken(row) : null;
  }

  async delete(request: DeleteStravaTokenRequest): Promise<void> {
    await this.knex<StravaTokenRow>(this.tableName)
      .where({ user_id: request.userId })
      .delete();
  }

  private mapToStravaToken(row: StravaTokenRow): StravaToken {
    return new StravaToken(
      row.id,
      row.user_id,
      row.strava_athlete_id,
      row.access_token,
      row.refresh_token,
      row.expires_at,
      row.updated_at,
      row.created_at,
    );
  }
}
