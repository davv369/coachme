import { AUTH_API_BEARER_BUILDER_KEY } from '@modules/auth/application/decorators/authenticated.decorator';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@common/logger/logger';

export const setupDocumentation = async (
  app: INestApplication<any>,
  port: number,
) => {
  const logger = new Logger('Swagger');

  const config = new DocumentBuilder()
    .setTitle('CoachMe API')
    .setDescription('The CoachMe API description')
    .setVersion('1.0')
    .setOpenAPIVersion('3.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      AUTH_API_BEARER_BUILDER_KEY,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/json',
    yamlDocumentUrl: 'docs/yaml',
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
    },
  });

  logger.log(`📚 Swagger documentation available at http://localhost:${port}/docs`);
};

