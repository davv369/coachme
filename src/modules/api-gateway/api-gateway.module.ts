import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayHttpInAdapter } from './infrastructure/adapters/in/http/api-gateway.http.in-adapter';

@Module({
  imports: [ConfigModule],
  controllers: [ApiGatewayHttpInAdapter],
  providers: [],
})
export class ApiGatewayModule {}

