import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Segurança: Helmet (Proteção contra vulnerabilidades web comuns via HTTP Headers)
  app.use(helmet());

  // Segurança: Validação Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos não definidos no DTO
      forbidNonWhitelisted: true, // recusa requisição se enviar campos não mapeados
      transform: true, // transforma payload automaticamente para as tipagens do DTO
    }),
  );

  // Segurança: CORS — em produção aceita apenas a URL do frontend configurada
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  const isDev = configService.get<string>('NODE_ENV') !== 'production';

  app.enableCors({
    origin: isDev
      ? [
          frontendUrl,
          /^http:\/\/10\.0\.2\.2/, // Emulador Android (alias do localhost do PC host)
          /^http:\/\/localhost/,   // Desenvolvimento local
        ]
      : [frontendUrl], // Produção: apenas a URL real do frontend
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0'); // escuta em todas as interfaces (Wi-Fi, Tailscale, etc.)
  console.log(`🚀 Backend rodando em http://0.0.0.0:${port}`);
}
bootstrap();
