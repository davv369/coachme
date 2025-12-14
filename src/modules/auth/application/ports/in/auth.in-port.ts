import { LoginRequestDto, LoginResponseDto } from '@common/dto/api-gateway/auth/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from '@common/dto/api-gateway/auth/register.dto';
import { RefreshTokenRequestDto, RefreshTokenResponseDto } from '@common/dto/api-gateway/auth/refresh-token.dto';
import { BootstrapAdminRequestDto, BootstrapAdminResponseDto } from '@common/dto/api-gateway/auth/bootstrap.dto';

export const AUTH_IN_PORT = Symbol('AUTH_IN_PORT');

export interface AuthInPort {
  login(command: LoginRequestDto): Promise<LoginResponseDto>;
  register(command: RegisterRequestDto): Promise<RegisterResponseDto>;
  refreshToken(command: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto>;
  bootstrapAdmin(command: BootstrapAdminRequestDto): Promise<BootstrapAdminResponseDto>;
}

