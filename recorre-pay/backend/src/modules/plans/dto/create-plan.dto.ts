import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  price: number;

  @IsEnum(['WEEKLY', 'MONTHLY', 'YEARLY'], { message: 'Frequência inválida' })
  interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  intervalCount?: number;
}
