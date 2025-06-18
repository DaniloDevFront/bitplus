import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FindCategoryDto {
  @ApiPropertyOptional({
    description: 'ID da categoria',
    example: 1
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  id?: number;

  @ApiPropertyOptional({
    description: 'Nome da categoria',
    example: 'Receitas'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categorias premium',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  premium?: boolean;
} 