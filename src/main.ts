import { Logger } from '@common/logger/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionsFilter } from '@common/error-handling/exceptions.filter';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { setupDocumentation } from '@common/api-docs/setup-documentation';

async function bootstrap() {
  const logger = new Logger('App');

  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'docs', method: RequestMethod.GET }],
  });
  app.useGlobalFilters(new ExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const PORT = Number(process.env.PORT || 3000);

  await setupDocumentation(app, PORT);
  await app.listen(PORT);

  logger.log(`🚀 Application running on http://localhost:${PORT}`);
}

bootstrap();
