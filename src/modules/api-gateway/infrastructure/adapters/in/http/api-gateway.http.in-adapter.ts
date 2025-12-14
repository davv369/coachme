import { Body, Controller, Get, Post, Inject } from '@nestjs/common';
import { Logger } from '@common/logger/logger';
import {
  Authenticated,
  CurrentUser,
} from '@modules/auth/application/decorators';
import { JwtPayload } from '@modules/auth/domain/jwt-payload';
import { UserRole } from '@modules/auth/domain/user-role';
import {
  API_GATEWAY_AUTH_IN_PORT,
  ApiGatewayAuthInPort,
} from '../../../../application/ports/in/auth.in-port';
import { LoginRequestDto, LoginResponseDto } from '@common/dto/api-gateway/auth/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from '@common/dto/api-gateway/auth/register.dto';
import { RefreshTokenRequestDto, RefreshTokenResponseDto } from '@common/dto/api-gateway/auth/refresh-token.dto';
import { BootstrapAdminRequestDto, BootstrapAdminResponseDto } from '@common/dto/api-gateway/auth/bootstrap.dto';
import { MeResponseDto } from '@common/dto/api-gateway/auth/me.dto';

@Controller()
export class ApiGatewayHttpInAdapter {
  private readonly logger = new Logger(ApiGatewayHttpInAdapter.name);

  constructor(
    @Inject(API_GATEWAY_AUTH_IN_PORT)
    private readonly authInPort: ApiGatewayAuthInPort,
  ) {}

  @Get()
  getRoot() {
    return {
      message: 'Hello from CoachMe!',
      status: 'ok',
    };
  }

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
  async register(@Body() body: RegisterRequestDto): Promise<RegisterResponseDto> {
    this.logger.log(`Register attempt for email: ${body.email}`);
    return this.authInPort.register({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
    });
  }

  @Post('auth/refresh')
  async refresh(@Body() body: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    this.logger.log('Refresh token request');
    return this.authInPort.refreshToken({
      refreshToken: body.refreshToken,
    });
  }

  @Get('me')
  @Authenticated()
  async getMe(@CurrentUser() user: JwtPayload): Promise<MeResponseDto> {
    this.logger.log(`User ${user.email} accessed /me endpoint`);
    return {
      userId: user.sub,
      email: user.email,
      role: user.role,
    };
  }

  @Post('auth/bootstrap')
  async bootstrap(@Body() body: BootstrapAdminRequestDto): Promise<BootstrapAdminResponseDto> {
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
