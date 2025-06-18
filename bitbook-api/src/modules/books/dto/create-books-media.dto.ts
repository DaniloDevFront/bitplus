import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateBooksMediaDto {
  @ApiProperty({ description: 'URL do arquivo de mídia' })
  @IsString()
  file_url: string;

  @ApiProperty({ description: 'URL da imagem pequena', required: false })
  @IsString()
  @IsOptional()
  img_small?: string;

  @ApiProperty({ description: 'URL da imagem média', required: false })
  @IsString()
  @IsOptional()
  img_medium?: string;

  @ApiProperty({ description: 'URL da imagem grande', required: false })
  @IsString()
  @IsOptional()
  img_large?: string;

  @ApiProperty({ description: 'ID do livro relacionado' })
  @IsNumber()
  books_id: number;
} 