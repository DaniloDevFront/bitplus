import { ApiProperty } from '@nestjs/swagger';

export class BookResponseDto {
  @ApiProperty({
    description: 'ID do livro',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Título do livro',
    example: 'Delícias Refrescantes de Verão'
  })
  title: string;

  @ApiProperty({
    description: 'URL da capa do livro',
    example: 'https://fakeimg.pl/116x160?text=Capa'
  })
  cover: string;

  @ApiProperty({
    description: 'Indica se o livro é premium',
    example: false
  })
  premium: boolean;
}

export class CategoryGroupResponseDto {
  @ApiProperty({
    description: 'ID da categoria',
    example: 1
  })
  category_id: number;

  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Receitas'
  })
  category_name: string;

  @ApiProperty({
    description: 'Lista de livros da categoria',
    type: [BookResponseDto]
  })
  books: BookResponseDto[];
} 