import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateAnimalDto {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'O brinco deve ser um texto.' })
  @IsNotEmpty({ message: 'O brinco é obrigatório.' })
  tag: string;

  @IsString({ message: 'A raça deve ser um texto.' })
  @IsNotEmpty({ message: 'A raça é obrigatória.' })
  breed: string;

  @IsString({ message: 'A categoria deve ser um texto.' })
  @IsNotEmpty({ message: 'A categoria é obrigatória.' })
  category: string;

  @IsString({ message: 'O status deve ser um texto.' })
  @IsNotEmpty({ message: 'O status é obrigatório.' })
  status: string;

  @IsNumber({}, { message: 'A meta diária deve ser um número.' })
  @IsOptional()
  dailyTarget?: number;

  @IsNumber({}, { message: 'O peso deve ser um número.' })
  @IsOptional()
  weight?: number;

  @IsNumber({}, { message: 'O ECC deve ser um número.' })
  @IsOptional()
  ecc?: number;

  @IsDateString({}, { message: 'Data de nascimento inválida.' })
  @IsOptional()
  birthDate?: string;

  @IsDateString({}, { message: 'Data de inseminação inválida.' })
  @IsOptional()
  lastInsemination?: string;

  @IsDateString({}, { message: 'Data de parto inválida.' })
  @IsOptional()
  lastCalving?: string;

  @IsDateString({}, { message: 'Previsão de parto inválida.' })
  @IsOptional()
  expectedCalving?: string;

  @IsDateString({}, { message: 'Data de secagem inválida.' })
  @IsOptional()
  dryingDate?: string;

  @IsString({ message: 'A linha genética deve ser um texto.' })
  @IsOptional()
  geneticLine?: string;

  @IsString({ message: 'A origem deve ser um texto.' })
  @IsOptional()
  origin?: string;

  @IsString({ message: 'O nome do pai deve ser um texto.' })
  @IsOptional()
  sireName?: string;

  @IsString({ message: 'O nome da mãe deve ser um texto.' })
  @IsOptional()
  damName?: string;

  @IsString({ message: 'O brinco do pai deve ser um texto.' })
  @IsOptional()
  fatherTag?: string;

  @IsString({ message: 'O brinco da mãe deve ser um texto.' })
  @IsOptional()
  motherTag?: string;

  @IsString({ message: 'O código de registro deve ser um texto.' })
  @IsOptional()
  registrationCode?: string;
}
