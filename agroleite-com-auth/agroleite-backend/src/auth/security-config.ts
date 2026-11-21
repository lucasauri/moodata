import { ConfigService } from '@nestjs/config';

export function getRequiredJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET')?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET deve existir e ter pelo menos 32 caracteres.');
  }
  return secret;
}
