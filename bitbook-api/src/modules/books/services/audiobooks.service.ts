import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Books } from '../entities/books.entity';
import { BooksSheet } from '../entities/book-sheet.entity';
import { CreateEbookDto } from '../dto/create-ebook.dto';
import { BooksMedia } from '../entities/books-media.entity';
import { BooksMediaHelper } from '../helpers/books-media.helper';
import { BookTrack } from '../entities/book-track.entity';
import { ContentType } from '../interfaces/ebook.interface';
import { UpdateEbookDto } from '../dto/update-ebook.dto';
import { Category } from '../../categories/entities/category.entity';
import { UploadsService } from '../../uploads/uploads.service';
import { UpdateBookTrackDto } from '../dto/create-book-track.dto';
import { CreateBookTrackDto } from '../dto/create-book-track.dto';

@Injectable()
export class AudiobooksService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly booksMediaHelper: BooksMediaHelper,
    private readonly uploadsService: UploadsService
  ) { }

  async create(
    payload: CreateEbookDto,
    cover: Express.Multer.File,
    tracks: Express.Multer.File[],
    trackCovers?: Express.Multer.File[]
  ): Promise<any> {
    const { sheet, category_id, ...ebookData } = payload;
    let uploadedFiles: string[] = [];

    try {
      return await this.entityManager.transaction(async (manager) => {
        // Buscar a categoria
        const category = await manager.findOne(Category, {
          where: { id: category_id }
        });

        if (!category) {
          throw new NotFoundException(`Categoria com ID ${category_id} não encontrada`);
        }

        // Criar o ebook
        const ebook = manager.create(Books, {
          ...ebookData,
          type: ContentType.AUDIOBOOK,
          category
        });
        await manager.save(ebook);

        const bookSheet = manager.create(BooksSheet, {
          author: sheet.author,
          genre: sheet.genre,
          year: sheet.year,
          ref: sheet.ref,
          book: ebook
        });

        await manager.save(bookSheet);

        // Processar e salvar a mídia
        const mediaData = await this.booksMediaHelper.processBookMedia(cover, tracks, ContentType.AUDIOBOOK);

        // Armazenar URLs dos arquivos enviados para possível rollback
        if (mediaData.tracks) {
          uploadedFiles = mediaData.tracks.map(track => track.file_url);
        }
        if (mediaData.img_small) uploadedFiles.push(mediaData.img_small);
        if (mediaData.img_medium) uploadedFiles.push(mediaData.img_medium);
        if (mediaData.img_large) uploadedFiles.push(mediaData.img_large);

        const media = manager.create(BooksMedia, {
          img_small: mediaData.img_small,
          img_medium: mediaData.img_medium,
          img_large: mediaData.img_large,
          book: ebook
        });

        await manager.save(media);

        // Criar as tracks
        if (mediaData.tracks) {
          const tracksPromises = mediaData.tracks.map(async (track, index) => {
            let trackCoverData = null;

            // Processar cover da track se existir
            if (trackCovers && trackCovers[index]) {
              trackCoverData = await this.booksMediaHelper.processTrackCover(trackCovers[index]);

              // Adicionar URLs das covers ao array de arquivos para possível rollback
              if (trackCoverData) {
                uploadedFiles.push(trackCoverData.cover_small);
                uploadedFiles.push(trackCoverData.cover_medium);
                uploadedFiles.push(trackCoverData.cover_large);
              }
            }

            return manager.create(BookTrack, {
              title: payload.track_titles?.[index] || track.file_url.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Track ${index + 1}`,
              audio_url: track.file_url,
              duration: "00:00:00", // Será atualizado posteriormente
              order: index + 1,
              description: null,
              media,
              ...(trackCoverData && {
                cover_small: trackCoverData.cover_small,
                cover_medium: trackCoverData.cover_medium,
                cover_large: trackCoverData.cover_large
              })
            });
          });

          const tracks = await Promise.all(tracksPromises);
          await manager.save(tracks);
        }

        // Buscar o ebook criado com todas as relações
        const createdEbook = await manager.findOne(Books, {
          where: { id: ebook.id },
          relations: ['category', 'media', 'media.tracks', 'sheet']
        });

        return {
          id: createdEbook.id,
          type: createdEbook.type,
          title: createdEbook.title,
          premium: createdEbook.premium,
          high: createdEbook.high,
          description: createdEbook.description,
          media: createdEbook.media ? {
            id: createdEbook.media.id,
            img_small: createdEbook.media.img_small,
            img_medium: createdEbook.media.img_medium,
            img_large: createdEbook.media.img_large,
            tracks: createdEbook.media.tracks?.map(track => ({
              id: track.id,
              title: track.title,
              audio_url: track.audio_url,
              duration: track.duration,
              order: track.order,
              cover_small: track.cover_small,
              cover_medium: track.cover_medium,
              cover_large: track.cover_large
            })) || []
          } : null,
          sheet: createdEbook.sheet ? {
            author: createdEbook.sheet.author,
            genre: createdEbook.sheet.genre,
            year: createdEbook.sheet.year,
            ref: createdEbook.sheet.ref
          } : null,
          category: createdEbook.category ? [{
            id: createdEbook.category.id,
            category_name: createdEbook.category.name
          }] : []
        };
      });
    } catch (error) {
      // Em caso de erro, fazer rollback dos arquivos enviados
      if (uploadedFiles.length > 0) {
        await Promise.all(uploadedFiles.map(file => this.uploadsService.deleteFile(file)));
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(`Erro ao criar audiobook: ${error.message}`);
    }
  }

  async update(
    id: number,
    payload: UpdateEbookDto,
    cover: Express.Multer.File
  ): Promise<any> {
    const { sheet, ...ebookData } = payload;

    const ebook = await this.entityManager.findOne(Books, {
      where: { id },
      relations: ['sheet', 'category', 'media']
    });

    if (!ebook) {
      throw new NotFoundException(`Audiobook com ID ${id} não encontrado`);
    }

    // Atualizar capa se fornecida
    if (cover) {
      const mediaData = await this.booksMediaHelper.processBookMedia(cover, null, ebook.type);

      if (ebook.media) {
        if (ebook.media.img_small) {
          if (!ebook.media.img_small.includes('default')) {
            await this.uploadsService.deleteFile(ebook.media.img_small);
          }
        }
        if (ebook.media.img_medium) {
          if (!ebook.media.img_medium.includes('default')) {
            await this.uploadsService.deleteFile(ebook.media.img_medium);
          }
        }
        if (ebook.media.img_large) {
          if (!ebook.media.img_large.includes('default')) {
            await this.uploadsService.deleteFile(ebook.media.img_large);
          }
        }

        const result = {
          img_small: mediaData.img_small,
          img_medium: mediaData.img_medium,
          img_large: mediaData.img_large,
          book: ebook
        }

        await this.entityManager.update(BooksMedia, ebook.media.id, result);
      } else {
        const result = {
          img_small: mediaData.img_small,
          img_medium: mediaData.img_medium,
          img_large: mediaData.img_large,
          book: ebook
        }

        const media = this.entityManager.create(BooksMedia, {
          ...result,
          book: ebook
        });

        await this.entityManager.save(media);
      }
    }

    return this.entityManager.transaction(async (manager) => {
      // Atualizar o ebook
      await manager.update(Books, id, ebookData);

      // Atualizar a ficha técnica se fornecida
      if (sheet) {
        if (ebook.sheet) {
          await manager.update(BooksSheet, ebook.sheet.id, sheet);
        } else {
          const sheetEbook = manager.create(BooksSheet, {
            ...sheet,
            book: { id }
          });
          await manager.save(sheetEbook);
        }
      }

      // Retornar o ebook atualizado
      const updatedEbook = await manager.findOne(Books, {
        where: { id },
        relations: ['sheet', 'category', 'media', 'media.tracks'],
        select: {
          id: true,
          type: true,
          title: true,
          premium: true,
          high: true,
          description: true,
          sheet: {
            id: true,
            author: true,
            genre: true,
            year: true,
            ref: true
          },
          category: {
            id: true,
            name: true
          },
          media: {
            id: true,
            file_url: true,
            img_small: true,
            img_medium: true,
            img_large: true,
            tracks: {
              id: true,
              title: true,
              audio_url: true,
              duration: true,
              order: true,
              cover_small: true,
              cover_medium: true,
              cover_large: true
            }
          }
        }
      });

      return {
        id: updatedEbook.id,
        type: updatedEbook.type,
        title: updatedEbook.title,
        premium: updatedEbook.premium,
        high: updatedEbook.high,
        description: updatedEbook.description,
        media: updatedEbook.media ? {
          id: updatedEbook.media.id,
          file_url: updatedEbook.media.file_url,
          img_small: updatedEbook.media.img_small,
          img_medium: updatedEbook.media.img_medium,
          img_large: updatedEbook.media.img_large,
          tracks: updatedEbook.media?.tracks?.map(track => ({
            id: track.id,
            title: track.title,
            audio_url: track.audio_url,
            duration: track.duration,
            order: track.order,
            cover_small: track.cover_small,
            cover_medium: track.cover_medium,
            cover_large: track.cover_large
          })) || []
        } : null,
        sheet: updatedEbook.sheet ? {
          author: updatedEbook.sheet.author,
          genre: updatedEbook.sheet.genre,
          year: updatedEbook.sheet.year,
          ref: updatedEbook.sheet.ref
        } : null,
        category: updatedEbook.category ? [{
          id: updatedEbook.category.id,
          category_name: updatedEbook.category.name
        }] : []
      };
    });
  }

  /**
   * Tracks
   */
  async createTrack(
    bookId: number,
    payload: CreateBookTrackDto,
    cover: Express.Multer.File,
    audio: Express.Multer.File
  ): Promise<any> {
    const book = await this.entityManager.findOne(Books, {
      where: { id: bookId },
      relations: ['media']
    });

    if (!book) {
      throw new NotFoundException(`Livro com ID ${bookId} não encontrado`);
    }

    if (!audio) {
      throw new BadRequestException('Arquivo de áudio é obrigatório');
    }

    const audioData = await this.booksMediaHelper.processBookMedia(null, [audio], ContentType.AUDIOBOOK);

    if (!audioData.tracks?.[0]) {
      throw new BadRequestException('Erro ao processar arquivo de áudio');
    }

    if (!cover) {
      throw new BadRequestException('O arquivo de imagem é obrigatório');
    }

    const coverData = await this.booksMediaHelper.processTrackCover(cover);

    // Cria a track
    const track = this.entityManager.create(BookTrack, {
      media: book.media,
      title: payload.title,
      audio_url: audioData.tracks[0].file_url,
      duration: payload.duration.toString(),
      order: payload.order,
      description: payload.description,
      cover_small: coverData?.cover_small,
      cover_medium: coverData?.cover_medium,
      cover_large: coverData?.cover_large
    });

    const response = await this.entityManager.save(track);

    return {
      id: response.id,
      title: response.title,
      audio_url: response.audio_url,
      duration: response.duration,
      order: response.order,
      cover_small: response.cover_small,
      cover_medium: response.cover_medium,
      cover_large: response.cover_large
    };
  }

  async updateTrack(
    id: number,
    payload: UpdateBookTrackDto,
    cover?: Express.Multer.File,
    audio?: Express.Multer.File
  ): Promise<BookTrack> {
    const { title, order, duration, description } = payload;

    const track = await this.entityManager.findOne(BookTrack, {
      where: { id },
    });

    if (!track) {
      throw new NotFoundException(`Faixa de áudio com ID ${id} não encontrada`);
    }

    // Atualiza o cover se fornecido
    if (cover) {
      const response = await this.booksMediaHelper.processTrackCover(cover);

      if (track.cover_small) {
        if (!track.cover_small.includes('default')) {
          await this.uploadsService.deleteFile(track.cover_small);
        }
      }
      if (track.cover_medium) {
        if (!track.cover_medium.includes('default')) {
          await this.uploadsService.deleteFile(track.cover_medium);
        }
      }
      if (track.cover_large) {
        if (!track.cover_large.includes('default')) {
          await this.uploadsService.deleteFile(track.cover_large);
        }
      }

      // Atualiza com as novas covers
      track.cover_small = response.cover_small;
      track.cover_medium = response.cover_medium;
      track.cover_large = response.cover_large;
    }

    // Atualiza o audio se fornecido
    if (audio) {
      const response = await this.booksMediaHelper.processBookMedia(null, [audio], ContentType.AUDIOBOOK);

      if (response.tracks?.[0]) {
        if (track.audio_url) {
          await this.uploadsService.deleteFile(track.audio_url);
        }

        track.audio_url = response.tracks[0].file_url;
      }
    }

    if (title) {
      track.title = title;
    }

    if (order) {
      track.order = order;
    }

    if (duration) {
      track.duration = duration;
    }

    if (description !== undefined) {
      track.description = description;
    }

    return await this.entityManager.save(track);
  }

  async deleteTrack(id: number): Promise<void> {
    const track = await this.entityManager.findOne(BookTrack, {
      where: { id },
      relations: ['media']
    });

    if (!track) {
      throw new NotFoundException(`Faixa de áudio com ID ${id} não encontrada`);
    }

    // Coletar todos os arquivos para remoção
    const filesToDelete = [
      track.audio_url,
      track.cover_small,
      track.cover_medium,
      track.cover_large
    ].filter(Boolean);

    await Promise.all(
      filesToDelete.map(file => this.uploadsService.deleteFile(file))
    );

    await this.entityManager.remove(track);
  }
}

