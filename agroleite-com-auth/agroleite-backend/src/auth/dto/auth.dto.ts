import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  @MaxLength(255, { message: 'E-mail deve ter no máximo 255 caracteres.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @MaxLength(128, { message: 'A senha deve ter no máximo 128 caracteres.' })
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório.' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres.' })
  name: string;

  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  @MaxLength(255, { message: 'E-mail deve ter no máximo 255 caracteres.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(128, { message: 'A senha deve ter no máximo 128 caracteres.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome da fazenda é obrigatório.' })
  @MaxLength(100, { message: 'Nome da fazenda deve ter no máximo 100 caracteres.' })
  farmName: string;
}
