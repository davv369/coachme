import { LoggerModule } from '@common/logger/logger.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayModule } from './modules/api-gateway/api-gateway.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    AuthModule,
    UsersModule,
    ApiGatewayModule,
  ],
})
export class AppModule {}
