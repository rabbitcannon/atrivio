import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    { rawBody: true } // Enable raw body for webhook signature verification
  );

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // CORS configuration using Fastify's native plugin for better compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(fastifyCors as any, {
    origin: process.env['CORS_ORIGINS']?.split(',') ?? [
      'http://localhost:3000',
      'http://localhost:3002',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    maxAge: 1, // 1 second cache to prevent stale preflight issues during development
  });

  // Multipart/file upload configuration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(fastifyMultipart as any, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 1, // 1 file per request
    },
  });

  // Swagger/OpenAPI setup (development only)
  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Haunt Platform API')
      .setDescription('Multi-tenant haunt industry management system API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port, '0.0.0.0');
}

bootstrap();
