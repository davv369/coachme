import { Controller, Get, Param } from '@nestjs/common';
import { Logger } from '@common/logger/logger';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get()
  getHello() {
    this.logger.log('Hello endpoint called');
    return {
      message: 'Hello from CoachMe!',
      status: 'ok',
    };
  }

  @Get('health')
  getHealth() {
    this.logger.log('Health check endpoint called');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}

