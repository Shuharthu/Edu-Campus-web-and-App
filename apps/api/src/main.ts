import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { getEnv } from './config/env';
import { loadRootEnv } from './config/load-env';
import { buildOpenApiDocument } from './openapi.setup';

async function bootstrap() {
  loadRootEnv();
  const env = getEnv();
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.useWebSocketAdapter(new WsAdapter(app));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const origins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Active-Role-Assignment-Id'],
  });

  app.setGlobalPrefix(env.API_PREFIX.replace(/^\//, ''));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const document = buildOpenApiDocument(app);
  if (env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(env.API_PORT);
  logger.log(`Smart EDU API listening on http://localhost:${env.API_PORT}${env.API_PREFIX}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
