import { Module } from '@nestjs/common';
import { TrainerAthleteService } from './application/services/trainer-athlete.service';
import { TRAINER_ATHLETE_IN_PORT } from './application/ports/in/trainer-athlete.in-port';
import { TrainerAthleteDatabaseModule } from './infrastructure/adapters/out/persistence/database/trainer-athlete.database.module';

@Module({
  imports: [TrainerAthleteDatabaseModule],
  controllers: [], // Handled by API Gateway
  providers: [
    {
      provide: TRAINER_ATHLETE_IN_PORT,
      useClass: TrainerAthleteService,
    },
  ],
  exports: [TRAINER_ATHLETE_IN_PORT],
})
export class TrainerAthletesModule {}
