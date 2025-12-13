import { Body, Controller, Get, Post } from '@nestjs/common';
import { Logger } from '@common/logger/logger';
import {
  Authenticated,
  CurrentUser,
} from '@modules/auth/application/decorators';
import { JwtPayload } from '@modules/auth/domain/jwt-payload';
import { JwtService } from '@modules/auth/application/services/jwt.service';
import { UserRole } from '@modules/auth/domain/user-role';

@Controller()
export class ApiGatewayHttpInAdapter {
  private readonly logger = new Logger(ApiGatewayHttpInAdapter.name);

  constructor(private readonly jwtService: JwtService) {}

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
  async login(@Body() body: { email: string; password: string }) {
    this.logger.log(`Login attempt for email: ${body.email}`);
    // TODO: Implement login logic with auth module
    return {
      message: 'Login endpoint - to be implemented',
      email: body.email,
    };
  }

  @Post('auth/register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      role: string;
    },
  ) {
    this.logger.log(`Register attempt for email: ${body.email}`);
    // TODO: Implement register logic with users and auth modules
    return {
      message: 'Register endpoint - to be implemented',
      email: body.email,
    };
  }

  @Post('auth/refresh')
  async refresh(@Body() _body: { refreshToken: string }) {
    this.logger.log('Refresh token request');
    // TODO: Implement refresh token logic with auth module
    return {
      message: 'Refresh endpoint - to be implemented',
    };
  }

  @Post('auth/test-token')
  async generateTestTokenPost(
    @Body() body: { userId?: string; email?: string; role?: UserRole },
  ) {
    this.logger.log(`Generating test token for ${body.email || 'default'}`);
    const tokens = this.jwtService.generateTokenPair(
      body.userId || 'test-user-id',
      body.email || 'test@example.com',
      body.role || UserRole.ATHLETE,
    );
    return {
      message: 'Test token generated',
      ...tokens,
    };
  }

  @Get('auth/test-token')
  async generateTestTokenGet() {
    this.logger.log('Generating default test token');
    const tokens = this.jwtService.generateTokenPair(
      'test-user-id',
      'test@example.com',
      UserRole.TRAINER,
    );
    return {
      ...tokens,
    };
  }

  @Get('me')
  @Authenticated()
  async getMe(@CurrentUser() user: JwtPayload) {
    this.logger.log(`User ${user.email} accessed /me endpoint`);
    return {
      userId: user.sub,
      email: user.email,
      role: user.role,
    };
  }
}
