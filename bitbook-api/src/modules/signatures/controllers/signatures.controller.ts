import { Controller, Post, Body, Put, Param, Delete, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignaturesService } from '../services/signatures.service';
import { CreateSignatureDto, UpdateSignatureDto } from '../dto/signatures.dto';


@ApiTags('Assinaturas')
@Controller('signatures')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova assinatura' })
  @ApiResponse({
    status: 201,
    description: 'Assinatura criada com sucesso',
    type: CreateSignatureDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() payload: CreateSignatureDto) {
    return this.signaturesService.create(payload);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar assinatura' })
  @ApiResponse({
    status: 200,
    description: 'Assinatura atualizada com sucesso',
    type: UpdateSignatureDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async update(@Param('id') id: number, @Body() payload: UpdateSignatureDto) {
    return this.signaturesService.update(id, payload);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async delete(@Param('id') id: number) {
    return this.signaturesService.delete(id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar assinatura por ID' })
  @ApiResponse({ status: 200, description: 'Assinatura encontrada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async findById(@Param('id') id: number) {
    return this.signaturesService.findById(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar todas as assinaturas' })
  @ApiResponse({ status: 200, description: 'Assinaturas encontradas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAll() {
    return this.signaturesService.findAll();
  }

} 