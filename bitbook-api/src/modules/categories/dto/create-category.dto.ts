import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Receitas'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Indica se a categoria é premium',
    default: false,
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  premium?: boolean;

  @ApiProperty({
    description: 'Icone da categoria',
  })
  @IsString()
  @IsOptional()
  ico?: string;
} 