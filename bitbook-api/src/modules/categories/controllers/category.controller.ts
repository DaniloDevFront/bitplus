import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { FindCategoryDto } from '../dto/find-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Categorias')
@Controller('categories')
// @UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiResponse({
    status: 201,
    description: 'Categoria criada com sucesso',
    type: CreateCategoryDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('ico'))
  async create(@Body() payload: CreateCategoryDto, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo do icone é obrigatório');
    }

    return this.categoryService.create(payload, file);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiResponse({
    status: 200,
    description: 'Categoria atualizada com sucesso',
    type: UpdateCategoryDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('ico'))
  async update(@Param('id') id: number, @Body() payload: UpdateCategoryDto, @UploadedFile() file: Express.Multer.File) {
    return this.categoryService.update(id, payload, file);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover categoria' })
  @ApiResponse({ status: 200, description: 'Categoria removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async delete(@Param('id') id: number) {
    return this.categoryService.delete(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar categorias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias encontradas',
    type: [CreateCategoryDto]
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async find(@Query() query: FindCategoryDto) {
    const { id, name, premium } = query;

    if (id) return this.categoryService.findById(id);
    if (name) return this.categoryService.findByName(name);
    if (premium !== undefined) return this.categoryService.findByPremium(premium);

    return this.categoryService.findAll();
  }
} 