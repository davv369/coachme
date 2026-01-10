import { LoggerModule } from '@common/logger/logger.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayModule } from '@modules/api-gateway/api-gateway.module';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { ExercisesModule } from '@modules/exercises/exercises.module';
import { TrainingPlansModule } from '@modules/training-plans/training-plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    AuthModule,
    UsersModule,
    ExercisesModule,
    TrainingPlansModule,
    ApiGatewayModule,
  ],
})
export class AppModule {}
