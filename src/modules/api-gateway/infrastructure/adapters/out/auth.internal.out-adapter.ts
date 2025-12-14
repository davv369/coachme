import { Injectable, Inject } from '@nestjs/common';
import { AuthOutPort } from '../../../application/ports/out/auth.out-port';
import {
  AUTH_IN_PORT,
  AuthInPort,
} from '@modules/auth/application/ports/in/auth.in-port';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/api-gateway/auth/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from '@common/dto/api-gateway/auth/register.dto';
import { RefreshTokenRequestDto, RefreshTokenResponseDto } from '@common/dto/api-gateway/auth/refresh-token.dto';
import { BootstrapAdminRequestDto, BootstrapAdminResponseDto } from '@common/dto/api-gateway/auth/bootstrap.dto';

@Injectable()
export class AuthInternalOutAdapter implements AuthOutPort {
  constructor(
    @Inject(AUTH_IN_PORT)
    private readonly authInPort: AuthInPort,
  ) {}

  async login(request: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authInPort.login(request);
  }

  async register(request: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.authInPort.register(request);
  }

  async refreshToken(request: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    return this.authInPort.refreshToken(request);
  }

  async bootstrapAdmin(request: BootstrapAdminRequestDto): Promise<BootstrapAdminResponseDto> {
    return this.authInPort.bootstrapAdmin(request);
  }
}

