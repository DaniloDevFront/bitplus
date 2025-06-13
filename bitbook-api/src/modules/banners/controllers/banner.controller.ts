import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { BannerService } from '../services/banner.service';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { FindBannerDto } from '../dto/find-banner.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Banners')
@Controller('banners')
// @UseGuards(JwtAuthGuard)
export class BannerController {
  constructor(private readonly bannerService: BannerService) { }


  @Post()
  @ApiOperation({ summary: 'Criar novo banner' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('banner'))
  async create(@Body() payload: CreateBannerDto, @UploadedFile() file: Express.Multer.File,) {
    if (!file) {
      throw new BadRequestException('Arquivo do banner é obrigatório');
    }

    return this.bannerService.create(payload, file);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar banner' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('banner'))
  async update(@Param('id') id: number, @Body() payload: UpdateBannerDto, @UploadedFile() file: Express.Multer.File) {
    if (!id) {
      throw new BadRequestException(`ID do banner não informado`);
    }

    return this.bannerService.update(id, payload, file);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover banner' })
  async delete(@Param('id') id: number) {
    return this.bannerService.delete(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar banners' })
  async find(@Query() query: FindBannerDto) {
    const { id, premium, provider_id } = query;

    if (id) return this.bannerService.findById(id);
    if (premium !== undefined) return this.bannerService.findByPremium(premium);
    if (provider_id) return this.bannerService.findByProvider(provider_id);

    return this.bannerService.findAll();
  }
} 