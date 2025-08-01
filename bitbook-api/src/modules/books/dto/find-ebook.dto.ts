import { IsString, IsBoolean, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ExploreLabel, ExploreLabelEnum } from '../interfaces/explore.interface';

export class FindEbookDto {
  @ApiPropertyOptional({
    description: 'ID do ebook',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? Number(value) : undefined)
  id?: number;

  // to-do: remover apos ajustes do token
  @ApiPropertyOptional({
    description: 'ID do usuário',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? Number(value) : undefined)
  user_id?: number;

  @ApiPropertyOptional({
    description: 'Título do ebook',
    example: 'O Senhor dos Anéis'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ebooks premium',
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

  @ApiPropertyOptional({
    description: 'Filtrar por ebooks de áudio',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  audiobooks?: boolean;

  @ApiPropertyOptional({
    description: 'ID da categoria',
    example: 1
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'all') return 'all';
    return value ? Number(value) : undefined;
  })
  category?: number | 'all';

  @ApiPropertyOptional({
    description: 'Filtrar por ebooks em destaque',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  high?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por ebooks chegados',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  arrived?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de exploração',
    enum: ExploreLabelEnum,
    example: 'arrived'
  })
  @IsOptional()
  @IsEnum(ExploreLabelEnum)
  explore?: ExploreLabel;

  @ApiPropertyOptional({
    description: 'Filtrar para landpage',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  landpage?: boolean;
} 