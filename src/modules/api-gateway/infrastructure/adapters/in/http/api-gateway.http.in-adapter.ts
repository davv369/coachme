import { Body, Controller, Get, Post } from '@nestjs/common';
import { Logger } from '@common/logger/logger';

@Controller()
export class ApiGatewayHttpInAdapter {
  private readonly logger = new Logger(ApiGatewayHttpInAdapter.name);

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
  async refresh(@Body() body: { refreshToken: string }) {
    this.logger.log('Refresh token request');
    // TODO: Implement refresh token logic with auth module
    return {
      message: 'Refresh endpoint - to be implemented',
    };
  }
}

