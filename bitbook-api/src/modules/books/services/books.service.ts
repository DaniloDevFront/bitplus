import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { Books } from '../entities/books.entity';
import { BooksSheet } from '../entities/book-sheet.entity';
import { CreateEbookDto } from '../dto/create-ebook.dto';
import { UpdateEbookDto } from '../dto/update-ebook.dto';
import { ExploreLabel } from '../interfaces/explore.interface';
import { Category } from '../../categories/entities/category.entity';
import { Bookcase } from '../../bookcase/entities/bookcase.entity';
import { ReadingService } from '../../reading/services/reading.service';
import { ContentType } from '../interfaces/ebook.interface';
import { BooksMedia } from '../entities/books-media.entity';
import { BooksMediaHelper } from '../helpers/books-media.helper';
import { DateHelper } from '../../../shared/helpers/date.helper';
import { UploadsService } from '../../uploads/uploads.service';
import { Reading } from 'src/modules/reading/entities/reading.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly readingService: ReadingService,
    private readonly booksMediaHelper: BooksMediaHelper,
    private readonly uploadsService: UploadsService
  ) { }

  async create(payload: CreateEbookDto, cover: Express.Multer.File, file: Express.Multer.File): Promise<any> {
    const { sheet, category_id, ...ebookData } = payload;

    // Verificar se a categoria existe
    const category = await this.entityManager.findOne(Category, {
      where: { id: category_id }
    });

    if (!category) {
      throw new BadRequestException(`Categoria com ID ${category_id} não encontrada`);
    }

    try {
      const mediaData = await this.booksMediaHelper.processBookMedia(cover, file, ebookData.type);

      return this.entityManager.transaction(async (manager) => {
        // Criar o ebook
        const ebook = manager.create(Books, {
          ...ebookData,
          category
        });
        await manager.save(ebook);


        const result = {
          file_url: mediaData.file_url,
          img_small: mediaData.img_small,
          img_medium: mediaData.img_medium,
          img_large: mediaData.img_large,
          book: ebook
        }

        // Criar a mídia
        const media = manager.create(BooksMedia, {
          ...result,
          book: ebook
        });
        await manager.save(media);

        // Criar a ficha técnica
        if (sheet) {
          const sheetEbook = manager.create(BooksSheet, {
            author: sheet.author,
            genre: sheet.genre,
            year: sheet.year,
            ref: sheet.ref,
            book: ebook
          });
          await manager.save(sheetEbook);
        }

        // Buscar o ebook com todas as relações usando o manager da transação
        const createdEbook = await manager.findOne(Books, {
          where: { id: ebook.id },
          relations: ['sheet', 'category', 'media', 'media.tracks'],
          select: {
            id: true,
            title: true,
            premium: true,
            high: true,
            type: true,
            description: true,
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
                order: true
              }
            },
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
            }
          }
        });

        if (!createdEbook) {
          throw new NotFoundException(`Books com ID ${ebook.id} não encontrado`);
        }

        return {
          id: createdEbook.id,
          type: createdEbook.type,
          title: createdEbook.title,
          premium: createdEbook.premium,
          high: createdEbook.high,
          description: createdEbook.description,
          bookcase: false,
          media: createdEbook.media ? {
            id: createdEbook.media.id,
            file_url: createdEbook.media.file_url,
            img_small: createdEbook.media.img_small,
            img_medium: createdEbook.media.img_medium,
            img_large: createdEbook.media.img_large,
            tracks: createdEbook.media?.tracks?.map(track => ({
              id: track.id,
              title: track.title,
              audio_url: track.audio_url,
              duration: track.duration,
              order: track.order
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
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new BadRequestException(`Categoria com ID ${category_id} não encontrada`);
      }
      throw error;
    }
  }

  async update(id: number, payload: UpdateEbookDto, cover: Express.Multer.File, file: Express.Multer.File): Promise<any> {
    const { sheet, category_id, ...ebookData } = payload;

    if (category_id) {
      const category = await this.entityManager.findOne(Category, {
        where: { id: category_id }
      });

      if (!category) {
        throw new BadRequestException(`Categoria com ID ${category_id} não encontrada`);
      }
    }

    const ebook = await this.entityManager.findOne(Books, {
      where: { id },
      relations: ['sheet', 'category', 'media']
    });

    if (!ebook) {
      throw new NotFoundException(`Books com ID ${id} não encontrado`);
    }

    if (cover) {
      // Processar nova mídia
      const mediaData = await this.booksMediaHelper.processBookMedia(cover, file, ebook.type);

      // Deletar mídia antiga se existir
      if (mediaData.file_url) {
        if (ebook.media) {
          await this.booksMediaHelper.deleteBookMedia(ebook.media);
        }
      }

      // Se já existe uma mídia, atualiza
      if (ebook.media) {

        const result = {
          file_url: mediaData.file_url,
          img_small: mediaData.img_small,
          img_medium: mediaData.img_medium,
          img_large: mediaData.img_large
        }

        await this.entityManager.update(BooksMedia, ebook.media.id, result);
      } else {
        // Se não existe, cria uma nova

        const result = {
          file_url: mediaData.file_url,
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
              order: true
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
            order: track.order
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

  async delete(id: number): Promise<{ success: boolean; message: string; deleted_at: string }> {
    const ebook = await this.entityManager.findOne(Books, {
      where: { id },
      relations: ['sheet', 'media', 'media.tracks']
    });

    if (!ebook) {
      throw new NotFoundException(`Books com ID ${id} não encontrado`);
    }

    // Remover registros relacionados em readings (antes do livro)
    await this.entityManager.delete('readings', { book_id: id });

    // Remover registros relacionados em bookcases (antes do livro)
    await this.entityManager.delete('bookcases', { book_id: id });

    if (ebook.media) {
      // Coletar URLs dos arquivos para remoção
      const filesToDelete: string[] = [];

      // Adicionar URLs das imagens
      if (ebook.media.img_small) filesToDelete.push(ebook.media.img_small);
      if (ebook.media.img_medium) filesToDelete.push(ebook.media.img_medium);
      if (ebook.media.img_large) filesToDelete.push(ebook.media.img_large);

      // Se for ebook, adicionar URL do arquivo
      if ((ebook.type === ContentType.EBOOK || ebook.type === ContentType.AMBOS) && ebook.media.file_url) {
        filesToDelete.push(ebook.media.file_url);
      }

      // Se for audiobook, adicionar URLs das tracks
      if (ebook.type === ContentType.AUDIOBOOK && ebook.media.tracks) {
        ebook.media.tracks.forEach(track => {
          if (track.audio_url) filesToDelete.push(track.audio_url);
        });
      }

      // Remover arquivos do S3
      if (filesToDelete.length > 0) {
        await Promise.all(filesToDelete.map(file => this.uploadsService.deleteFile(file)));
      }

      // Remover a relação com BooksMedia
      await this.entityManager.remove(ebook.media);
    }

    if (ebook.sheet) {
      // Remover a relação com BooksSheet
      await this.entityManager.remove(ebook.sheet);
    }

    // Remover o ebook
    await this.entityManager.remove(ebook);

    return {
      success: true,
      message: `Book com ID ${id} removido com sucesso`,
      deleted_at: new Date().toISOString()
    };
  }

  async findAll(): Promise<any[]> {
    const ebooks = await this.entityManager.find(Books, {
      relations: ['category', 'media', 'media.tracks'],
      order: { id: 'DESC' },
      select: {
        id: true,
        title: true,
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
            order: true
          }
        },
        premium: true,
        high: true,
        category: {
          id: true,
          name: true
        }
      }
    });

    // Agrupar ebooks por categoria
    const groupedByCategory = ebooks.reduce((acc, ebook) => {
      const categoryId = ebook.category.id;
      const categoryName = ebook.category.name;

      // Encontrar ou criar o grupo da categoria
      let categoryGroup = acc.find(group => group.category_id === categoryId);
      if (!categoryGroup) {
        categoryGroup = {
          category_id: categoryId,
          category_name: categoryName,
          books: []
        };
        acc.push(categoryGroup);
      }

      // Adicionar o ebook ao grupo da categoria
      categoryGroup.books.push({
        id: ebook.id,
        title: ebook.title,
        media: ebook.media ? {
          id: ebook.media.id,
          file_url: ebook.media.file_url,
          img_small: ebook.media.img_small,
          img_medium: ebook.media.img_medium,
          img_large: ebook.media.img_large,
          tracks: ebook.media?.tracks?.map(track => ({
            id: track.id,
            title: track.title,
            audio_url: track.audio_url,
            duration: track.duration,
            order: track.order
          })) || []
        } : null,
        premium: ebook.premium,
        high: ebook.high
      });

      return acc;
    }, []);

    return groupedByCategory;
  }

  async findById(id: number, user_id?: number): Promise<any> {
    const ebook = await this.entityManager.findOne(Books, {
      where: { id },
      relations: ['sheet', 'category', 'media', 'media.tracks'],
      select: {
        id: true,
        type: true,
        title: true,
        premium: true,
        high: true,
        description: true,
        media: {
          id: true,
          file_url: true,
          img_small: true,
          img_medium: true,
          img_large: true,
          tracks: {
            id: true,
            title: true,
            cover_small: true,
            cover_medium: true,
            cover_large: true,
            audio_url: true,
            duration: true,
            order: true
          }
        },
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
        }
      }
    });

    if (!ebook) {
      throw new NotFoundException(`Books com ID ${id} não encontrado`);
    }

    let inBookcase = false;
    let userProgress = null;

    if (user_id) {
      const bookcase = await this.entityManager.findOne(Bookcase, {
        where: { book_id: id, user_id, status: true }
      });
      inBookcase = !!bookcase;

      // buscar reading do usuario
      const reading = await this.entityManager.findOne(Reading, {
        where: {
          book: { id },
          user: { id: user_id },
          status: true
        }
      });

      if (reading) {
        userProgress = {
          current_page: reading.current_page,
          total_pages: reading.total_pages,
          progress: reading.progress,
          updated_at: reading.updated_at
        };
      }
    }

    return {
      id: ebook.id,
      type: ebook.type,
      title: ebook.title,
      premium: ebook.premium,
      high: ebook.high,
      bookcase: inBookcase,
      description: ebook.description,
      media: ebook.media ? {
        id: ebook.media.id,
        file_url: ebook.media.file_url,
        img_small: ebook.media.img_small,
        img_medium: ebook.media.img_medium,
        img_large: ebook.media.img_large,
        tracks: ebook.media?.tracks?.map(track => ({
          id: track.id,
          title: track.title,
          cover_small: track.cover_small,
          cover_medium: track.cover_medium,
          cover_large: track.cover_large,
          audio_url: track.audio_url,
          duration: track.duration,
          order: track.order
        })) || []
      } : null,
      sheet: ebook.sheet ? {
        author: ebook.sheet.author,
        genre: ebook.sheet.genre,
        year: ebook.sheet.year,
        ref: ebook.sheet.ref
      } : null,
      category: [{
        id: ebook.category.id,
        category_name: ebook.category.name
      }],
      progress: userProgress ?? null,
      created_at: DateHelper.formatDateTime(ebook.created_at)
    };
  }

  async findByTitle(title: string): Promise<any[]> {
    const ebooks = await this.entityManager.find(Books, {
      where: { title },
      relations: ['category', 'media', 'media.tracks'],
      order: { id: 'DESC' },
      select: {
        id: true,
        title: true,
        premium: true,
        high: true,
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
            order: true
          }
        },
        category: {
          id: true,
          name: true
        }
      }
    });

    // Agrupar ebooks por categoria
    const groupedByCategory = ebooks.reduce((acc, ebook) => {
      const categoryId = ebook.category.id;
      const categoryName = ebook.category.name;

      // Encontrar ou criar o grupo da categoria
      let categoryGroup = acc.find(group => group.category_id === categoryId);
      if (!categoryGroup) {
        categoryGroup = {
          category_id: categoryId,
          category_name: categoryName,
          books: []
        };
        acc.push(categoryGroup);
      }

      // Adicionar o ebook ao grupo da categoria
      categoryGroup.books.push({
        id: ebook.id,
        title: ebook.title,
        media: ebook.media ? {
          id: ebook.media.id,
          file_url: ebook.media.file_url,
          img_small: ebook.media.img_small,
          img_medium: ebook.media.img_medium,
          img_large: ebook.media.img_large,
          tracks: ebook.media?.tracks?.map(track => ({
            id: track.id,
            title: track.title,
            audio_url: track.audio_url,
            duration: track.duration,
            order: track.order
          })) || []
        } : null,
        premium: ebook.premium,
        high: ebook.high
      });

      return acc;
    }, []);

    return groupedByCategory;
  }

  async findByPremium(premium: boolean): Promise<Books[]> {
    return this.entityManager.find(Books, {
      where: { premium },
      relations: ['sheet', 'category', 'media', 'media.tracks'],
      order: { id: 'DESC' }
    });
  }

  async findByHigh(high: boolean): Promise<any[]> {
    const ebooks = await this.entityManager.find(Books, {
      where: { high },
      relations: ['category', 'media', 'media.tracks'],
      order: { id: 'DESC' },
      select: {
        id: true,
        title: true,
        premium: true,
        high: true,
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
            order: true
          }
        },
        category: {
          id: true,
          name: true
        }
      }
    });

    return ebooks.map(ebook => ({
      id: ebook.id,
      title: ebook.title,
      premium: ebook.premium,
      high: ebook.high,
      media: ebook.media ? {
        id: ebook.media.id,
        file_url: ebook.media.file_url,
        img_small: ebook.media.img_small,
        img_medium: ebook.media.img_medium,
        img_large: ebook.media.img_large,
        tracks: ebook.media?.tracks?.map(track => ({
          id: track.id,
          title: track.title,
          audio_url: track.audio_url,
          duration: track.duration,
          order: track.order
        })) || []
      } : null,
      category: [{
        id: ebook.category.id,
        category_name: ebook.category.name
      }],
      created_at: DateHelper.formatDateTime(ebook.created_at)
    }));
  }

  async findByCategory(category_id: number | 'all'): Promise<any[]> {

    const condition = category_id === 'all' ? {} : { category: { id: category_id } };

    const ebooks = await this.entityManager.find(Books, {
      where: condition,
      relations: ['category', 'media', 'media.tracks'],
      order: { id: 'DESC' },
      select: {
        id: true,
        title: true,
        type: true,
        premium: true,
        high: true,
        category: {
          id: true,
          name: true
        },
        created_at: true
      }
    });

    const type = {
      [ContentType.AUDIOBOOK]: 'Audiobook',
      [ContentType.EBOOK]: 'Ebook',
      [ContentType.AMBOS]: 'Ambos',
    }

    return ebooks.map(ebook => ({
      id: ebook.id,
      title: ebook.title,
      type: type[ebook.type],
      premium: ebook.premium,
      high: ebook.high,
      media: ebook.media ? {
        id: ebook.media.id,
        file_url: ebook.media.file_url,
        img_small: ebook.media.img_small,
        img_medium: ebook.media.img_medium,
        img_large: ebook.media.img_large,
        tracks: ebook.media?.tracks?.map(track => ({
          id: track.id,
          title: track.title,
          audio_url: track.audio_url,
          duration: track.duration,
          order: track.order
        })) || []
      } : null,
      category: [{
        id: ebook.category.id,
        category_name: ebook.category.name
      }],
      created_at: DateHelper.formatDateTime(ebook.created_at)
    }));
  }

  async findByExplore(explore: ExploreLabel, user_id?: number): Promise<any[]> {
    let query: any = {
      relations: ['category', 'media', 'media.tracks'],
      order: { id: 'DESC' },
      select: {
        id: true,
        title: true,
        type: true,
        premium: true,
        high: true,
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
            order: true
          }
        }
      }
    };

    switch (explore) {
      case 'arrived':
        query.order = { created_at: 'DESC' };
        break;
      case 'highlights':
        query.where = { high: true };
        break;
      case 'audiobooks':
        query.where = { type: ContentType.AUDIOBOOK };
        query.orderBy = { created_at: 'DESC' };
        break;
      case 'reading':
        if (!user_id) {
          throw new NotFoundException('Usuário não autenticado');
        }
        return this.readingService.findAllByUser(user_id);
    }

    const ebooks = await this.entityManager.find(Books, query);

    const type = {
      [ContentType.AUDIOBOOK]: 'Audiobook',
      [ContentType.EBOOK]: 'Ebook',
      [ContentType.AMBOS]: 'Ambos',
    }

    return ebooks.map(ebook => ({
      id: ebook.id,
      title: ebook.title,
      type: type[ebook.type],
      premium: ebook.premium,
      high: ebook.high,
      media: ebook.media ? {
        id: ebook.media.id,
        file_url: ebook.media.file_url,
        img_small: ebook.media.img_small,
        img_medium: ebook.media.img_medium,
        img_large: ebook.media.img_large,
        tracks: ebook.media?.tracks?.map(track => ({
          id: track.id,
          title: track.title,
          audio_url: track.audio_url,
          duration: track.duration,
          order: track.order
        })) || []
      } : null,
      category: [{
        id: ebook.category.id,
        category_name: ebook.category.name
      }],
      created_at: DateHelper.formatDateTime(ebook.created_at)
    }));
  }

  // Rota simplificada para home
  async findByArrived(): Promise<any[]> {
    const ebooks = await this.entityManager.find(Books, {
      relations: ['media', 'media.tracks'],
      order: { created_at: 'DESC' },
      take: 5,
      select: {
        id: true,
        title: true,
        premium: true,
        high: true,
        created_at: true,
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
            order: true
          }
        }
      }
    });

    if (ebooks.length === 0) {
      return [];
    }

    return ebooks;
  }

  async findByAudiobooks(): Promise<any[]> {
    const ebooks = await this.entityManager.find(Books, {
      where: { type: In([ContentType.AUDIOBOOK, ContentType.AMBOS]) },
      relations: ['media'],
      order: { id: 'DESC' },
      take: 5,
      select: {
        id: true,
        title: true,
        premium: true,
        high: true,
        media: {
          id: true,
          img_small: true,
          img_medium: true,
          img_large: true,
        }
      }
    });

    return ebooks.map(ebook => ({
      id: ebook.id,
      title: ebook.title,
      premium: ebook.premium,
      high: ebook.high,
      media: ebook.media ? {
        id: ebook.media.id,
        img_small: ebook.media.img_small,
        img_medium: ebook.media.img_medium,
        img_large: ebook.media.img_large,
      } : null,
    }));
  }

  async findByLandpage(): Promise<any[]> {
    const ebooks = await this.entityManager.find(Books, {
      where: { landpage: true },
      relations: ['media'],
      order: { id: 'DESC' },
      take: 5,
    });

    return ebooks.map(ebook => ({
      id: ebook.id,
      title: ebook.title,
      cover: ebook.media?.img_large ?? null
    }));
  }
} 