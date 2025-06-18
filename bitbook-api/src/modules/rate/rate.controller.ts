import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RateService } from './rate.service';
import { CreateRateDto, FindRateDto, UpdateRateDto } from './dto/rate.dto';

@ApiTags('Avaliações')
@Controller('rate')
export class RateController {
  constructor(private readonly rateService: RateService) { }

  @Post()
  @ApiOperation({ summary: 'Criar nova avaliação' })
  @ApiResponse({
    status: 201,
    description: 'Avaliação criada com sucesso',
    type: CreateRateDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() payload: CreateRateDto) {
    return this.rateService.create(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar avaliação' })
  @ApiResponse({
    status: 200,
    description: 'Avaliação atualizada com sucesso',
    type: UpdateRateDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateRateDto,
  ) {
    return this.rateService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.rateService.delete(id);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar avaliações' })
  @ApiResponse({
    status: 200,
    description: 'Lista de avaliações encontradas',
    type: [CreateRateDto]
  })
  async find(@Query() query: FindRateDto) {
    const { id, user_id, rating, status } = query;

    if (id) return this.rateService.findById(id);
    if (user_id) return this.rateService.findByUser(user_id);
    if (rating) return this.rateService.findByRating(rating);
    if (status !== undefined) return this.rateService.findByStatus(status);

    return this.rateService.findAll();
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Buscar ultima avaliação ativa de um usuário específico' })
  @ApiResponse({
    status: 200,
    description: 'Ultima avaliação ativa do usuário',
    type: [CreateRateDto]
  })
  @ApiResponse({ status: 400, description: 'ID do usuário é obrigatório' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOneUser(@Param('id', ParseIntPipe) id: number) {
    if (!id) throw new BadRequestException('ID do usuário é obrigatório');

    return this.rateService.findByUser(id, false);
  }
} 