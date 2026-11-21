import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  app.use(json({ limit: '1mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configuredOrigins = (configService.get<string>('FRONTEND_URL') ?? '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const productionOrigins = [
    'https://moodata.vercel.app',
    'https://moodata-mx1ss4qxc-muudata.vercel.app',
    ...configuredOrigins,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (origin && productionOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (!isProduction) {
        const isLocalOrigin = !origin
          || origin.startsWith('http://localhost:')
          || origin.startsWith('http://127.0.0.1:')
          || origin.startsWith('http://10.0.2.2:')
          || origin.startsWith('http://100.')
          || /^https?:\/\/\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(origin ?? '');

        if (isLocalOrigin) return callback(null, true);
      }

      return callback(new Error(`Bloqueado por CORS: ${origin ?? 'origem ausente'}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(helmet());

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend rodando na porta ${port}`);
}

bootstrap();
