import {
  LoginRequestDto,
  LoginResponseDto,
} from '@common/dto/api-gateway/auth/login.dto';
import {
  RegisterRequestDto,
  RegisterResponseDto,
} from '@common/dto/api-gateway/auth/register.dto';
import {
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from '@common/dto/api-gateway/auth/refresh-token.dto';
import {
  BootstrapAdminRequestDto,
  BootstrapAdminResponseDto,
} from '@common/dto/api-gateway/auth/bootstrap.dto';

export const API_GATEWAY_AUTH_OUT_PORT = Symbol('API_GATEWAY_AUTH_OUT_PORT');

export interface ApiGatewayAuthOutPort {
  login(request: LoginRequestDto): Promise<LoginResponseDto>;
  register(request: RegisterRequestDto): Promise<RegisterResponseDto>;
  refreshToken(
    request: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto>;
  bootstrapAdmin(
    request: BootstrapAdminRequestDto,
  ): Promise<BootstrapAdminResponseDto>;
}
