import { Logger } from '@common/logger/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('App');
  
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.setGlobalPrefix('api');

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  
  logger.log(`🚀 Application running on http://localhost:${PORT}`);
}

bootstrap();
