import { LoginRequestDto, LoginResponseDto } from '@common/dto/api-gateway/auth/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from '@common/dto/api-gateway/auth/register.dto';
import { RefreshTokenRequestDto, RefreshTokenResponseDto } from '@common/dto/api-gateway/auth/refresh-token.dto';
import { BootstrapAdminRequestDto, BootstrapAdminResponseDto } from '@common/dto/api-gateway/auth/bootstrap.dto';

export const API_GATEWAY_AUTH_IN_PORT = Symbol('API_GATEWAY_AUTH_IN_PORT');

export interface ApiGatewayAuthInPort {
  login(command: LoginRequestDto): Promise<LoginResponseDto>;
  register(command: RegisterRequestDto): Promise<RegisterResponseDto>;
  refreshToken(command: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto>;
  bootstrapAdmin(command: BootstrapAdminRequestDto): Promise<BootstrapAdminResponseDto>;
}

