import { Controller, Post, Body, Put, Param, Delete, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSignatureDto, UpdateSignatureDto } from '../dto/signatures.dto';
import { CreateSignaturePlanDto } from '../dto/signature-plan.dto';
import { UpdateSignaturePlanDto } from '../dto/signature-plan.dto';
import { SignaturesPlansService } from '../services/signatures-plans.service';


@ApiTags('Assinaturas - Planos')
@Controller('signatures/plans')
export class SignaturesPlansController {
  constructor(private readonly signaturesPlansService: SignaturesPlansService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo plano de assinatura' })
  @ApiResponse({
    status: 201,
    description: 'Plano de assinatura criado com sucesso',
    type: CreateSignatureDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() payload: CreateSignaturePlanDto) {
    return this.signaturesPlansService.create(payload);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar plano de assinatura' })
  @ApiResponse({
    status: 200,
    description: 'Plano de assinatura atualizado com sucesso',
    type: UpdateSignatureDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async update(@Param('id') id: number, @Body() payload: UpdateSignaturePlanDto) {
    return this.signaturesPlansService.update(id, payload);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover plano de assinatura' })
  @ApiResponse({ status: 200, description: 'Plano de assinatura removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Plano de assinatura não encontrado' })
  async delete(@Param('id') id: number) {
    return this.signaturesPlansService.delete(id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar plano de assinatura por ID' })
  @ApiResponse({ status: 200, description: 'Plano de assinatura encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Plano de assinatura não encontrado' })
  async findById(@Param('id') id: number) {
    return this.signaturesPlansService.findById(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar todos os planos de assinatura' })
  @ApiResponse({ status: 200, description: 'Planos de assinatura encontrados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAll() {
    return this.signaturesPlansService.findAll();
  }

} 