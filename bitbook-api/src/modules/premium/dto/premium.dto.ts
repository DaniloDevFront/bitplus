import { PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePremiumPlanDto {
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

export class CreatePremiumDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsNotEmpty()
  benefits: string[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePremiumPlanDto)
  plans: CreatePremiumPlanDto[];
}

export class UpdatePremiumDto extends PartialType(CreatePremiumDto) {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class UpdatePremiumPlanDto extends PartialType(CreatePremiumPlanDto) { } 