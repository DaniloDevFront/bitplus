import { IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateBookcaseDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({
    description: 'ID do livro',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  book_id: number;
} 