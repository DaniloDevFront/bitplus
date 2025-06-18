import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Request, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { BooksService } from '../services/books.service';
import { CreateEbookDto } from '../dto/create-ebook.dto';
import { UpdateEbookDto } from '../dto/update-ebook.dto';
import { FindEbookDto } from '../dto/find-ebook.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('Books')
@Controller('books')
// @UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo ebook' })
  @ApiResponse({
    status: 201,
    description: 'Ebook criado com sucesso',
    type: CreateEbookDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cover', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ])
  )
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() payload: CreateEbookDto,
    @UploadedFiles() files: { cover?: Express.Multer.File[], file?: Express.Multer.File[] }
  ) {

    if (!files.cover?.[0]) {
      throw new BadRequestException('Arquivo de imagem é obrigatório');
    }

    if (!files.file?.[0]) {
      throw new BadRequestException('Arquivo de conteúdo é obrigatório');
    }

    return this.booksService.create(payload, files.cover?.[0], files.file?.[0]);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cover', maxCount: 1 },
      { name: 'file', maxCount: 1 }
    ])
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar ebook' })
  @ApiResponse({
    status: 200,
    description: 'Ebook atualizado com sucesso',
    type: UpdateEbookDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Ebook não encontrado' })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: number,
    @Body() payload: UpdateEbookDto,
    @UploadedFiles() files: { cover?: Express.Multer.File[], file?: Express.Multer.File[] }
  ) {
    return this.booksService.update(id, payload, files.cover?.[0], files.file?.[0]);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover ebook' })
  @ApiResponse({ status: 200, description: 'Ebook removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Ebook não encontrado' })
  async delete(@Param('id') id: number) {
    return this.booksService.delete(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar ebooks' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ebooks encontrados',
    type: [CreateEbookDto]
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async find(@Query() query: FindEbookDto) {
    const { id, title, premium, category, high, arrived, explore, audiobooks, user_id } = query;

    if (id) {
      return this.booksService.findById(id, user_id);
    }

    if (title) return this.booksService.findByTitle(title);
    if (premium !== undefined) return this.booksService.findByPremium(premium);
    if (category) return this.booksService.findByCategory(category);
    if (high !== undefined) return this.booksService.findByHigh(high);
    if (arrived) return this.booksService.findByArrived();
    if (audiobooks) return this.booksService.findByAudiobooks();
    if (explore) {
      return this.booksService.findByExplore(explore, user_id);
    }

    return this.booksService.findAll();
  }
} 