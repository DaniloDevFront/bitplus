import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateBookTrackDto {
  @ApiProperty({ description: 'ID do livro' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = Number(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  book_id: number;

  @ApiProperty({
    description: 'Título da faixa',
    example: 'Capítulo 1: Introdução'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Ordem da faixa no audiobook',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = Number(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  order: number;

  @ApiProperty({
    description: 'Duração da faixa em segundos',
    example: 1800
  })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({
    description: 'Descrição da faixa',
    example: 'Primeiro capítulo do audiobook'
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateBookTrackDto extends PartialType(CreateBookTrackDto) { }

export class TrackResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  audio_url: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  order: number;

  @ApiProperty()
  cover_small: string;

  @ApiProperty()
  cover_medium: string;

  @ApiProperty()
  cover_large: string;
}