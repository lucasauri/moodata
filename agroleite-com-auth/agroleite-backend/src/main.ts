import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Segurança: Validação Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos não definidos no DTO
      forbidNonWhitelisted: true, // recusa requisição se enviar campos não mapeados
      transform: true, // transforma payload automaticamente para as tipagens do DTO
    }),
  );

  // CORS – permite apenas origens conhecidas
  app.enableCors({
    origin: [
      'https://moodata.vercel.app',
      'https://moodata-mx1ss4qxc-muudata.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Segurança: Helmet (Proteção contra vulnerabilidades web comuns via HTTP Headers)
  app.use(helmet());

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0'); // escuta em todas as interfaces (Wi-Fi, Tailscale, etc.)
  console.log(`🚀 Backend rodando na porta ${port}`);
}
bootstrap();
