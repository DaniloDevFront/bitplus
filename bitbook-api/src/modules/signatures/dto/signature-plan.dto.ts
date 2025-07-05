import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSignaturePlanDto {
  @IsString()
  @IsNotEmpty()
  recorrence: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  price_label: string;

  @IsString()
  @IsNotEmpty()
  price: string;
}

export class UpdateSignaturePlanDto extends PartialType(CreateSignaturePlanDto) { } 