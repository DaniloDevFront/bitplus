import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFiles, BadRequestException, Put, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { CreateEbookDto } from '../dto/create-ebook.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AudiobooksService } from '../services/audiobooks.service';
import { UpdateEbookDto } from '../dto/update-ebook.dto';
import { TrackResponse, UpdateBookTrackDto } from '../dto/create-book-track.dto';
import { CreateBookTrackDto } from '../dto/create-book-track.dto';
import { ContentType } from '../interfaces/ebook.interface';

@ApiTags('Audiobooks')
@Controller('audiobooks')
//@UseGuards(JwtAuthGuard)
export class AudiobooksController {
  constructor(private readonly audiobooksService: AudiobooksService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo audiobook' })
  @ApiResponse({
    status: 201,
    description: 'Audiobook criado com sucesso',
    type: CreateEbookDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cover', maxCount: 1 },
      { name: 'tracks', maxCount: 10 },
      { name: 'track_covers', maxCount: 10 },
      { name: 'file', maxCount: 1 }
    ])
  )
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() payload: CreateEbookDto,
    @UploadedFiles() files: {
      cover?: Express.Multer.File[],
      tracks?: Express.Multer.File[],
      track_covers?: Express.Multer.File[],
      file?: Express.Multer.File[]
    }
  ) {
    if (payload.type === ContentType.AMBOS) {
      if (!files.file?.[0]) {
        throw new BadRequestException('PDF é obrigatório');
      }
    }

    if (!files.cover?.[0]) {
      throw new BadRequestException('Arquivo de imagem é obrigatório');
    }

    if (!files.tracks?.[0]) {
      throw new BadRequestException('Deve ser enviado pelo menos uma faixa de áudio');
    }

    if (files.track_covers && files.track_covers.length > files.tracks.length) {
      throw new BadRequestException('Número de covers não pode ser maior que o número de tracks');
    }

    if (payload.track_titles && payload.track_titles.length !== files.tracks.length) {
      throw new BadRequestException('O número de títulos deve corresponder ao número de tracks');
    }

    if (files.track_covers) {
      for (const cover of files.track_covers) {
        if (!cover.mimetype.match(/^image\/(jpeg|png)$/)) {
          throw new BadRequestException('As covers das tracks devem ser em formato JPEG ou PNG');
        }
      }
    }

    return this.audiobooksService.create(payload, files.cover?.[0], files.tracks, files.track_covers, files.file?.[0]);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar audiobook' })
  @ApiResponse({
    status: 200,
    description: 'Audiobook atualizado com sucesso',
    type: UpdateEbookDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Audiobook não encontrado' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cover', maxCount: 1 },
    ])
  )
  async update(
    @Param('id') id: number,
    @Body() payload: UpdateEbookDto,
    @UploadedFiles() files: {
      cover?: Express.Multer.File[]
    }
  ) {
    if (!id) {
      throw new BadRequestException(`ID do audiobook não informado`);
    }

    return this.audiobooksService.update(+id, payload, files.cover?.[0]);
  }

  /**
   * Tracks
   */
  @Post('/track')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar faixa de áudio' })
  @ApiResponse({
    status: 201,
    description: 'Faixa de áudio criada com sucesso',
    type: TrackResponse
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cover', maxCount: 1 },
      { name: 'audio', maxCount: 1 }
    ])
  )
  async createTrack(
    @Body() payload: CreateBookTrackDto,
    @UploadedFiles()
    files: {
      cover?: Express.Multer.File[];
      audio?: Express.Multer.File[];
    }
  ) {
    if (files.cover?.[0]) {
      const coverFile = files.cover[0];

      if (!coverFile.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
        throw new BadRequestException('Formato de imagem inválido. Use JPG ou PNG.');
      }
    } else {
      throw new BadRequestException('Arquivo de imagem é obrigatório');
    }

    if (!files.audio?.[0]) {
      throw new BadRequestException('Arquivo de áudio é obrigatório');
    }

    return await this.audiobooksService.createTrack(payload.book_id, payload, files.cover?.[0], files.audio[0]);
  }

  @Put('/track/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar faixa de áudio' })
  @ApiResponse({
    status: 200,
    description: 'Faixa de áudio atualizada com sucesso',
    type: TrackResponse
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Faixa não encontrada' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cover', maxCount: 1 },
      { name: 'audio', maxCount: 1 }
    ])
  )
  async updateTrack(
    @Param('id') id: number,
    @Body() payload: UpdateBookTrackDto,
    @UploadedFiles() files: {
      cover?: Express.Multer.File[],
      audio?: Express.Multer.File[]
    }
  ) {
    if (!id) {
      throw new BadRequestException(`ID da faixa não informado`);
    }

    if (files.cover && !files.cover[0].mimetype.match(/^image\/(jpeg|png)$/)) {
      throw new BadRequestException('A capa deve ser em formato JPEG ou PNG');
    }

    return this.audiobooksService.updateTrack(
      +id,
      payload,
      files.cover?.[0],
      files.audio?.[0]
    );
  }

  @Delete('/track/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar faixa de áudio' })
  @ApiResponse({
    status: 200,
    description: 'Faixa de áudio deletada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Faixa não encontrada' })
  async deleteTrack(@Param('id') id: number) {
    if (!id) {
      throw new BadRequestException(`ID da faixa não informado`);
    }

    return this.audiobooksService.deleteTrack(+id);
  }
}