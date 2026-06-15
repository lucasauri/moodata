import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateAnimalDto {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'O brinco deve ser um texto.' })
  @IsOptional()
  tag?: string;

  @IsString({ message: 'A raça deve ser um texto.' })
  @IsOptional()
  breed?: string;

  @IsString({ message: 'A categoria deve ser um texto.' })
  @IsOptional()
  category?: string;

  @IsString({ message: 'O status deve ser um texto.' })
  @IsOptional()
  status?: string;

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
}
