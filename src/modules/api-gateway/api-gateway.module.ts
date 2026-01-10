import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayHttpInAdapter } from './infrastructure/adapters/in/http/api-gateway.http.in-adapter';
import { ExerciseHttpInAdapter } from './infrastructure/adapters/in/http/exercises/exercise.http.in-adapter';
import { TrainingPlanHttpInAdapter } from './infrastructure/adapters/in/http/training-plans/training-plan.http.in-adapter';
import { TrainingSessionHttpInAdapter } from './infrastructure/adapters/in/http/training-sessions/training-session.http.in-adapter';
import { TrainerAthleteHttpInAdapter } from './infrastructure/adapters/in/http/trainer-athletes/trainer-athlete.http.in-adapter';
import { AuthModule } from '@auth/auth.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { TrainingPlansModule } from '../training-plans/training-plans.module';
import { TrainingSessionsModule } from '../training-sessions/training-sessions.module';
import { TrainerAthletesModule } from '../trainer-athletes/trainer-athletes.module';
import { ApiGatewayAuthService } from './application/services/auth.service';
import { API_GATEWAY_AUTH_IN_PORT } from './application/ports/in/auth.in-port';
import { API_GATEWAY_AUTH_OUT_PORT } from './application/ports/out/auth.out-port';
import { AuthInternalOutAdapter } from './infrastructure/adapters/out/auth.internal.out-adapter';
import { EXERCISE_OUT_PORT } from './application/ports/out/exercise.out-port';
import { ExerciseInternalOutAdapter } from './infrastructure/adapters/out/exercise.internal.out-adapter';
import { TRAINING_PLAN_OUT_PORT } from './application/ports/out/training-plan.out-port';
import { TrainingPlanInternalOutAdapter } from './infrastructure/adapters/out/training-plan.internal.out-adapter';
import { TRAINING_SESSION_OUT_PORT } from './application/ports/out/training-session.out-port';
import { TrainingSessionInternalOutAdapter } from './infrastructure/adapters/out/training-session.internal.out-adapter';
import { TRAINER_ATHLETE_OUT_PORT } from './application/ports/out/trainer-athlete.out-port';
import { TrainerAthleteInternalOutAdapter } from './infrastructure/adapters/out/trainer-athlete.internal.out-adapter';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    ExercisesModule,
    TrainingPlansModule,
    TrainingSessionsModule,
    TrainerAthletesModule,
  ],
  controllers: [
    ApiGatewayHttpInAdapter,
    ExerciseHttpInAdapter,
    TrainingPlanHttpInAdapter,
    TrainingSessionHttpInAdapter,
    TrainerAthleteHttpInAdapter,
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
    {
      provide: TRAINING_SESSION_OUT_PORT,
      useClass: TrainingSessionInternalOutAdapter,
    },
    {
      provide: TRAINER_ATHLETE_OUT_PORT,
      useClass: TrainerAthleteInternalOutAdapter,
    },
  ],
})
export class ApiGatewayModule {}
