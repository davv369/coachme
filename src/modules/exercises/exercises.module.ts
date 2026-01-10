import { Module } from '@nestjs/common';
import { ExerciseService } from './application/services/exercise.service';
import { EXERCISE_IN_PORT } from './application/ports/in/exercise.in-port';
import { ExerciseDatabaseModule } from './infrastructure/adapters/out/persistence/database/exercise.database.module';
import { ExerciseHttpInAdapter } from './infrastructure/adapters/in/http/exercise.http.in-adapter';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ExerciseDatabaseModule, AuthModule],
  controllers: [ExerciseHttpInAdapter],
  providers: [
    {
      provide: EXERCISE_IN_PORT,
      useClass: ExerciseService,
    },
  ],
  exports: [EXERCISE_IN_PORT],
})
export class ExercisesModule {}
