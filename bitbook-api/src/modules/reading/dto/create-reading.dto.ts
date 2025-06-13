import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateReadingDto {
  @ApiProperty({ description: 'ID do livro' })
  @IsNumber()
  book_id: number;

  @ApiProperty({ description: 'Página atual', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  current_page?: number;

  @ApiProperty({ description: 'Total de páginas do livro', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  total_pages?: number;
} 