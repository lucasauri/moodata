import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateProductionDto {
  @IsString({ message: 'O ID do animal deve ser um texto.' })
  @IsNotEmpty({ message: 'O ID do animal é obrigatório.' })
  animalId: string;

  @IsDateString({}, { message: 'Data inválida.' })
  @IsOptional()
  date?: string;

  @IsNumber({}, { message: 'A quantidade deve ser um número.' })
  @IsNotEmpty({ message: 'A quantidade é obrigatória.' })
  amount: number;

  @IsString({ message: 'O período deve ser um texto.' })
  @IsNotEmpty({ message: 'O período é obrigatório.' })
  period: string;

  @IsString({ message: 'A qualidade deve ser um texto.' })
  @IsNotEmpty({ message: 'A qualidade é obrigatória.' })
  quality: string;

  @IsString({ message: 'O destino deve ser um texto.' })
  @IsNotEmpty({ message: 'O destino é obrigatório.' })
  destination: string;

  @IsString({ message: 'A observação deve ser um texto.' })
  @IsOptional()
  observation?: string;
}
