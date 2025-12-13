import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      message: 'Hello from CoachMe!',
      status: 'ok',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}

