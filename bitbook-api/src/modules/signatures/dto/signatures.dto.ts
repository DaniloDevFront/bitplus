import { PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSignatureDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsNotEmpty()
  benefits: string[];

  @IsNumber()
  @IsNotEmpty()
  plan_id: number;
}

export class UpdateSignatureDto extends PartialType(CreateSignatureDto) { } 