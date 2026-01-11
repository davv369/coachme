import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StravaService } from './application/services/strava.service';
import { StravaActivityMapperService } from './application/services/strava-activity-mapper.service';
import { STRAVA_IN_PORT } from './application/ports/in/strava.in-port';
import { StravaTokenDatabaseModule } from './infrastructure/adapters/out/persistence/database/strava-token.database.module';
import { STRAVA_API_OUT_PORT } from './application/ports/out/strava-api.out-port';
import { StravaApiAdapter } from './infrastructure/adapters/out/api/strava-api.adapter';
import { TrainingSessionsModule } from '../training-sessions/training-sessions.module';

@Module({
  imports: [ConfigModule, StravaTokenDatabaseModule, TrainingSessionsModule],
  controllers: [], // Handled by API Gateway
  providers: [
    {
      provide: STRAVA_IN_PORT,
      useClass: StravaService,
    },
    {
      provide: STRAVA_API_OUT_PORT,
      useClass: StravaApiAdapter,
    },
    StravaActivityMapperService,
  ],
  exports: [STRAVA_IN_PORT],
})
export class StravaModule {}
