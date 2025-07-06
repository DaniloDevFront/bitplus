import { Controller, Post, Body, Put, Param, Delete, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PremiumService } from '../services/premium.service';
import { CreatePremiumDto, UpdatePremiumDto } from '../dto/premium.dto';

@ApiTags('Premium')
@Controller('premium')
export class PremiumController {
  constructor(
    private readonly premiumService: PremiumService,
  ) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova assinatura' })
  @ApiResponse({
    status: 201,
    description: 'Assinatura criada com sucesso',
    type: CreatePremiumDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() payload: CreatePremiumDto) {
    return this.premiumService.create(payload);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar assinatura' })
  @ApiResponse({
    status: 200,
    description: 'Assinatura atualizada com sucesso',
    type: UpdatePremiumDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async update(@Param('id') id: number, @Body() payload: UpdatePremiumDto) {
    return this.premiumService.update(id, payload);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async delete(@Param('id') id: number) {
    return this.premiumService.delete(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar assinatura por ID' })
  @ApiResponse({ status: 200, description: 'Assinatura encontrada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async findById(@Query() query: { id?: number }) {
    const { id } = query;
    if (id !== undefined) return this.premiumService.findById(id);

    return this.premiumService.findAll();
  }
} 