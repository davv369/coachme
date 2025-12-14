import { Inject, Injectable } from '@nestjs/common';
import { ApiGatewayAuthInPort } from '../ports/in/auth.in-port';
import { AUTH_OUT_PORT, AuthOutPort } from '../ports/out/auth.out-port';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/api-gateway/auth/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from '@common/dto/api-gateway/auth/register.dto';
import { RefreshTokenRequestDto, RefreshTokenResponseDto } from '@common/dto/api-gateway/auth/refresh-token.dto';
import { BootstrapAdminRequestDto, BootstrapAdminResponseDto } from '@common/dto/api-gateway/auth/bootstrap.dto';

@Injectable()
export class ApiGatewayAuthService implements ApiGatewayAuthInPort {
  constructor(
    @Inject(AUTH_OUT_PORT)
    private readonly authOutPort: AuthOutPort,
  ) {}

  async login(command: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authOutPort.login(command);
  }

  async register(command: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.authOutPort.register(command);
  }

  async refreshToken(command: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    return this.authOutPort.refreshToken(command);
  }

  async bootstrapAdmin(command: BootstrapAdminRequestDto): Promise<BootstrapAdminResponseDto> {
    return this.authOutPort.bootstrapAdmin(command);
  }
}

