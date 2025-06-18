import { Controller, Get, Post, Body, Delete, Param, Query, UseGuards, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { BookcaseService } from '../services/bookcase.service';
import { CreateBookcaseDto } from '../dto/create-bookcase.dto';
import { CategoryGroupResponseDto } from '../dto/bookcase-response.dto';

@ApiTags('Bookcase')
@Controller('bookcase')
// @UseGuards(JwtAuthGuard)
export class BookcaseController {
  constructor(private readonly bookcaseService: BookcaseService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar livro à estante' })
  @ApiResponse({
    status: 201,
    description: 'Livro adicionado à estante com sucesso',
    type: CreateBookcaseDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Livro não encontrado' })
  async create(@Body() payload: CreateBookcaseDto) {
    if (!payload.book_id) {
      throw new BadRequestException('O ID do livro é obrigatório');
    }

    return await this.bookcaseService.create(payload);
  }

  @Delete(':book_id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover livro da estante' })
  @ApiResponse({ status: 200, description: 'Livro removido da estante com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Livro não encontrado na estante do usuário' })
  async delete(
    @Param('book_id') book_id: number,
    @Query('user_id') user_id: number
  ) {
    return this.bookcaseService.delete(book_id, user_id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar livros da estante do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de livros da estante agrupados por categoria',
    type: [CategoryGroupResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findByUser(@Query('user_id') user_id: number): Promise<CategoryGroupResponseDto[]> {
    return this.bookcaseService.findByUser(user_id);
  }
} 