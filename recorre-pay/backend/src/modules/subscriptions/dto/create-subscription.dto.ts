import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  customerId: string;

  @IsString()
  @IsNotEmpty({ message: 'Plano é obrigatório' })
  planId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Dia deve ser entre 1 e 28' })
  @Max(28, { message: 'Dia deve ser entre 1 e 28' })
  dueDay: number;
}
