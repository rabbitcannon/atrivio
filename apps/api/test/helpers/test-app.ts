import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, type TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';

let app: NestFastifyApplication | null = null;

export async function createTestApp(): Promise<NestFastifyApplication> {
  if (app) {
    return app;
  }

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
    { rawBody: true } // Enable raw body for webhook signature verification
  );

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  await app.init();

  const fastify = app.getHttpAdapter().getInstance();
  await fastify.ready();

  return app;
}

export async function closeTestApp(): Promise<void> {
  if (app) {
    await app.close();
    app = null;
  }
}

export function getTestApp(): NestFastifyApplication {
  if (!app) {
    throw new Error('Test app not initialized. Call createTestApp() first.');
  }
  return app;
}
