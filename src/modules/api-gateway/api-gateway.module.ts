import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayHttpInAdapter } from './infrastructure/adapters/in/http/api-gateway.http.in-adapter';
import { ExerciseHttpInAdapter } from './infrastructure/adapters/in/http/exercises/exercise.http.in-adapter';
import { TrainingPlanHttpInAdapter } from './infrastructure/adapters/in/http/training-plans/training-plan.http.in-adapter';
import { AuthModule } from '@auth/auth.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { TrainingPlansModule } from '../training-plans/training-plans.module';
import { ApiGatewayAuthService } from './application/services/auth.service';
import { API_GATEWAY_AUTH_IN_PORT } from './application/ports/in/auth.in-port';
import { API_GATEWAY_AUTH_OUT_PORT } from './application/ports/out/auth.out-port';
import { AuthInternalOutAdapter } from './infrastructure/adapters/out/auth.internal.out-adapter';
import { EXERCISE_OUT_PORT } from './application/ports/out/exercise.out-port';
import { ExerciseInternalOutAdapter } from './infrastructure/adapters/out/exercise.internal.out-adapter';
import { TRAINING_PLAN_OUT_PORT } from './application/ports/out/training-plan.out-port';
import { TrainingPlanInternalOutAdapter } from './infrastructure/adapters/out/training-plan.internal.out-adapter';

@Module({
  imports: [ConfigModule, AuthModule, ExercisesModule, TrainingPlansModule],
  controllers: [
    ApiGatewayHttpInAdapter,
    ExerciseHttpInAdapter,
    TrainingPlanHttpInAdapter,
  ],
  providers: [
    {
      provide: API_GATEWAY_AUTH_OUT_PORT,
      useClass: AuthInternalOutAdapter,
    },
    {
      provide: API_GATEWAY_AUTH_IN_PORT,
      useClass: ApiGatewayAuthService,
    },
    {
      provide: EXERCISE_OUT_PORT,
      useClass: ExerciseInternalOutAdapter,
    },
    {
      provide: TRAINING_PLAN_OUT_PORT,
      useClass: TrainingPlanInternalOutAdapter,
    },
  ],
})
export class ApiGatewayModule {}
