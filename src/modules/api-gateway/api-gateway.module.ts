import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayHttpInAdapter } from './infrastructure/adapters/in/http/api-gateway.http.in-adapter';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [ApiGatewayHttpInAdapter],
  providers: [],
})
export class ApiGatewayModule {}
