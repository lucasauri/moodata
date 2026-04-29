import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Importante para o frontend acessar a API
  await app.listen(3001);
}
bootstrap();
