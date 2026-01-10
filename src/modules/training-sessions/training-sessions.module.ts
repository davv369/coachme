import { Module } from '@nestjs/common';
import { TrainingSessionService } from './application/services/training-session.service';
import { TRAINING_SESSION_IN_PORT } from './application/ports/in/training-session.in-port';
import { TrainingSessionDatabaseModule } from './infrastructure/adapters/out/persistence/database/training-session.database.module';

@Module({
  imports: [TrainingSessionDatabaseModule],
  providers: [
    {
      provide: TRAINING_SESSION_IN_PORT,
      useClass: TrainingSessionService,
    },
  ],
  exports: [TRAINING_SESSION_IN_PORT],
})
export class TrainingSessionsModule {}
