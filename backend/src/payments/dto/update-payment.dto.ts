import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  details: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
