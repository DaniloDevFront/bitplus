import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSheetEbookDto {
  @ApiProperty({
    description: 'Autor do ebook',
    example: 'John Doe'
  })
  @IsString({ message: 'O autor deve ser um texto' })
  @IsNotEmpty({ message: 'O autor é obrigatório' })
  author: string;

  @ApiProperty({
    description: 'Gênero do ebook',
    example: 'Ficção'
  })
  @IsString({ message: 'O gênero deve ser um texto' })
  @IsNotEmpty({ message: 'O gênero é obrigatório' })
  genre: string;

  @ApiProperty({
    description: 'Ano de publicação',
    example: 2024
  })
  @IsNumber({}, { message: 'O ano deve ser um número' })
  @IsNotEmpty({ message: 'O ano é obrigatório' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = Number(value);
      return isNaN(parsed) ? undefined : parsed;
    }
    return value;
  })
  year: number;

  @ApiProperty({
    description: 'Referência do ebook',
    example: 'ISBN-123456789'
  })
  @IsString({ message: 'A referência deve ser um texto' })
  @IsNotEmpty({ message: 'A referência é obrigatória' })
  ref: string;
} 