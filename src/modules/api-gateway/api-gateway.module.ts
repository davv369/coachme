import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayHttpInAdapter } from './infrastructure/adapters/in/http/api-gateway.http.in-adapter';
import { AuthModule } from '../auth/auth.module';
import { ApiGatewayAuthService } from './application/services/auth.service';
import { API_GATEWAY_AUTH_IN_PORT } from './application/ports/in/auth.in-port';
import { AUTH_OUT_PORT } from './application/ports/out/auth.out-port';
import { AuthInternalOutAdapter } from './infrastructure/adapters/out/auth.internal.out-adapter';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [ApiGatewayHttpInAdapter],
  providers: [
    {
      provide: AUTH_OUT_PORT,
      useClass: AuthInternalOutAdapter,
    },
    {
      provide: API_GATEWAY_AUTH_IN_PORT,
      useClass: ApiGatewayAuthService,
    },
  ],
})
export class ApiGatewayModule {}
