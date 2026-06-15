import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório.' })
  name: string;

  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome da fazenda é obrigatório.' })
  farmName: string;
}
