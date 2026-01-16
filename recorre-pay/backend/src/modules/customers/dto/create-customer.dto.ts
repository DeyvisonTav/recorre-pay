import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'WhatsApp é obrigatório' })
  phone: string;

  @IsString()
  @IsOptional()
  document?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
