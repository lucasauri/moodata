import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateFarmConfigDto {
  @IsString({ message: 'O nome da fazenda deve ser um texto.' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'O nome do produtor deve ser um texto.' })
  @IsOptional()
  producer?: string;

  @IsString({ message: 'A localização deve ser um texto.' })
  @IsOptional()
  location?: string;

  @IsNumber({}, { message: 'Os dias de PVE devem ser um número.' })
  @IsOptional()
  pveDays?: number;

  @IsNumber({}, { message: 'Os dias de período de secagem devem ser um número.' })
  @IsOptional()
  dryingPeriodDays?: number;
}
