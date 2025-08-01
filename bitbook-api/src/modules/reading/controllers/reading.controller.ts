import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { ReadingService } from '../services/reading.service';
import { CreateReadingDto, UpdateReadingDto } from '../dto/create-reading.dto';

@ApiTags('Readings')
@Controller('readings')
//@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReadingController {
  constructor(private readonly readingService: ReadingService) { }

  @Post()
  @ApiOperation({ summary: 'Iniciar uma nova leitura' })
  @ApiResponse({
    status: 201,
    description: 'Leitura iniciada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() payload: CreateReadingDto) {
    return this.readingService.create(payload);
  }

  @Put('progress')
  @ApiOperation({ summary: 'Atualizar progresso da leitura' })
  @ApiResponse({
    status: 200,
    description: 'Progresso atualizado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Você não tem permissão para atualizar esta leitura' })
  async updateProgress(@Body() payload: UpdateReadingDto) {
    return this.readingService.updateProgress(payload.book_id, payload.current_page, payload.user_id);
  }

  @Delete()
  @ApiOperation({ summary: 'Remover leitura' })
  @ApiResponse({
    status: 200,
    description: 'Leitura removida com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Você não tem permissão para remover esta leitura' })
  async remove(@Query('book_id') book_id: number, @Request() req) {
    const user_id = req.user.userId;
    return this.readingService.remove(book_id, user_id);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar leituras' })
  @ApiResponse({
    status: 200,
    description: 'Lista de leituras encontradas',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async find(@Query() query: { book_id?: number }, @Request() req) {
    const user_id = req.user.userId;
    const { book_id } = query;

    if (book_id) {
      return this.readingService.findByUserAndBook(user_id, book_id);
    }

    return this.readingService.findAllByUser(user_id);
  }
} 