import { Module } from '@nestjs/common';
import { TrainingPlanService } from './application/services/training-plan.service';
import { TRAINING_PLAN_IN_PORT } from './application/ports/in/training-plan.in-port';
import { TrainingPlanDatabaseModule } from './infrastructure/adapters/out/persistence/database/training-plan.database.module';
import { TrainingPlanHttpInAdapter } from './infrastructure/adapters/in/http/training-plan.http.in-adapter';
import { AuthModule } from '../auth/auth.module';
import { ExercisesModule } from '../exercises/exercises.module';

@Module({
  imports: [TrainingPlanDatabaseModule, AuthModule, ExercisesModule],
  controllers: [TrainingPlanHttpInAdapter],
  providers: [
    {
      provide: TRAINING_PLAN_IN_PORT,
      useClass: TrainingPlanService,
    },
  ],
  exports: [TRAINING_PLAN_IN_PORT],
})
export class TrainingPlansModule {}
