import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateHealthEventDto {
  @IsString({ message: 'O ID do animal deve ser um texto.' })
  @IsNotEmpty({ message: 'O ID do animal é obrigatório.' })
  animalId: string;

  @IsDateString({}, { message: 'Data inválida.' })
  @IsOptional()
  date?: string;

  @IsDateString({}, { message: 'Data da próxima dose inválida.' })
  @IsOptional()
  nextDoseDate?: string;

  @IsString({ message: 'O tipo deve ser um texto.' })
  @IsNotEmpty({ message: 'O tipo é obrigatório.' })
  type: string;

  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  description: string;

  @IsString({ message: 'O responsável deve ser um texto.' })
  @IsOptional()
  responsible?: string;

  @IsNumber({}, { message: 'Os dias de carência devem ser um número.' })
  @IsOptional()
  withdrawalDays?: number;
}
