import { IsString, IsBoolean, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSheetEbookDto } from './create-sheet-ebook.dto';
import { CreateBookTrackDto } from './create-book-track.dto';
import { ContentType } from '../interfaces/ebook.interface';
import { Transform, Type } from 'class-transformer';

export class CreateEbookDto {
  @ApiProperty({
    description: 'Título do ebook',
    example: 'O Senhor dos Anéis'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'URL da capa do ebook',
    example: 'https://exemplo.com/capa.jpg'
  })
  @IsString()
  @IsOptional()
  cover?: string;

  @ApiProperty({
    description: 'Tipo do ebook',
    enum: ContentType,
    example: ContentType.EBOOK
  })
  @IsEnum(ContentType)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'ebook' || lowerValue === 'audiobook') {
        return lowerValue;
      }
    }
    return value;
  })
  type: ContentType;

  @ApiProperty({
    description: 'Indica se o ebook é premium',
    default: false,
    example: true
  })
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  premium: boolean;

  @ApiProperty({
    description: 'Indica se o ebook é destaque',
    default: false,
    example: true
  })
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  high: boolean;

  @ApiProperty({
    description: 'Descrição do ebook',
    example: 'Uma história épica sobre a jornada de Frodo para destruir o anel do poder'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'ID da categoria do ebook',
    example: 1
  })
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = Number(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  category_id: number;

  @ApiProperty({
    description: 'Informações adicionais do ebook',
    type: CreateSheetEbookDto
  })
  @IsOptional()
  @ValidateNested({ each: true, message: 'Dados da ficha técnica inválidos' })
  @Type(() => CreateSheetEbookDto)
  sheet?: CreateSheetEbookDto;

  @ApiProperty({
    description: 'Faixas de áudio (apenas para audiobooks)',
    type: [CreateBookTrackDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookTrackDto)
  tracks?: CreateBookTrackDto[];

  @ApiProperty({
    description: 'Títulos das faixas de áudio (apenas para audiobooks)',
    type: [String],
    required: false,
    example: ['Capítulo 1', 'Capítulo 2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  track_titles?: string[];
} 