import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Logger } from '@common/logger/logger';
import { Authenticated } from '@modules/auth/application/decorators';
import { UserRole } from '@modules/auth/domain/user-role';
import {
  API_GATEWAY_AUTH_IN_PORT,
  ApiGatewayAuthInPort,
} from '../../../../application/ports/in/auth.in-port';
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

@ApiTags('API Gateway')
@Controller()
export class ApiGatewayHttpInAdapter {
  private readonly logger = new Logger(ApiGatewayHttpInAdapter.name);

  constructor(
    @Inject(API_GATEWAY_AUTH_IN_PORT)
    private readonly authInPort: ApiGatewayAuthInPort,
  ) {}

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('auth/login')
  async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    this.logger.log(`Login attempt for email: ${body.email}`);
    return this.authInPort.login({
      email: body.email,
      password: body.password,
    });
  }

  @Post('auth/register')
  @Authenticated({ requiredRoles: [UserRole.ADMIN] })
  async register(
    @Body() body: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    this.logger.log(`Register attempt for email: ${body.email}`);
    return this.authInPort.register({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
    });
  }

  @Post('auth/refresh')
  async refresh(
    @Body() body: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    this.logger.log('Refresh token request');
    return this.authInPort.refreshToken({
      refreshToken: body.refreshToken,
    });
  }

  @Post('auth/bootstrap')
  async bootstrap(
    @Body() body: BootstrapAdminRequestDto,
  ): Promise<BootstrapAdminResponseDto> {
    this.logger.log('Bootstrap admin request');
    const tokens = await this.authInPort.bootstrapAdmin({
      email: body.email,
      password: body.password,
      name: body.name,
    });
    return {
      message: 'First admin user created successfully',
      ...tokens,
    };
  }
}
