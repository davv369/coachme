import { LoggerModule } from '@common/logger/logger.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayModule } from './modules/api-gateway/api-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    ApiGatewayModule,
  ],
})
export class AppModule {}
