import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Reading } from '../entities/reading.entity';
import { CreateReadingDto } from '../dto/create-reading.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { Books } from 'src/modules/books/entities/books.entity';
import { ReadingBookResponse, ReadingProgressResponse } from '../interfaces/reading.interface';

@Injectable()
export class ReadingService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async create(payload: CreateReadingDto): Promise<Reading> {
    const user = await this.entityManager.findOne(User, { where: { id: payload.user_id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const book = await this.entityManager.findOne(Books, { where: { id: payload.book_id } });
    if (!book) {
      throw new NotFoundException('Livro não encontrado');
    }

    // Verifica se já existe uma leitura ativa para este livro
    const existingReading = await this.entityManager.findOne(Reading, {
      where: {
        user: { id: payload.user_id },
        book: { id: payload.book_id },
        status: true
      }
    });

    if (existingReading) {
      throw new ForbiddenException('Você já possui uma leitura ativa para este livro');
    }

    // Calcula o progresso se current_page e total_pages forem fornecidos
    let progress = 0;
    if (payload.current_page && payload.total_pages) {
      progress = (payload.current_page / payload.total_pages) * 100;
    }

    const reading = this.entityManager.create(Reading, {
      user: { id: payload.user_id },
      book: { id: payload.book_id },
      current_page: payload.current_page || 0,
      progress: Number(progress.toFixed(2)),
      status: true
    });

    return this.entityManager.save(Reading, reading);
  }

  async updateProgress(book_id: number, current_page: number, total_pages: number, user_id: number): Promise<Reading> {
    const reading = await this.entityManager.findOne(Reading, {
      where: {
        user: { id: user_id },
        book: { id: book_id },
        status: true
      },
      relations: ['book', 'user'],
    });

    if (!reading) {
      throw new NotFoundException('Leitura não encontrada');
    }

    const progress = (current_page / total_pages) * 100;

    reading.current_page = current_page;
    reading.progress = Number(progress.toFixed(2));
    return this.entityManager.save(Reading, reading);
  }

  async remove(book_id: number, user_id: number): Promise<void> {
    const reading = await this.entityManager.findOne(Reading, {
      where: {
        user: { id: user_id },
        book: { id: book_id },
        status: true
      },
      relations: ['book', 'user'],
    });

    if (!reading) {
      throw new NotFoundException('Leitura não encontrada');
    }

    reading.status = false;
    await this.entityManager.save(Reading, reading);
  }

  async findAllByUser(user_id: number): Promise<ReadingBookResponse[]> {
    const readings = await this.entityManager.find(Reading, {
      where: { user: { id: user_id }, status: true },
      relations: ['book', 'book.media'],
      order: { updated_at: 'DESC' },
    });

    return readings.map(reading => ({
      id: reading.book.id,
      title: reading.book.title,
      media: reading.book.media ? {
        id: reading.book.media.id,
        file_url: reading.book.media.file_url,
        img_small: reading.book.media.img_small,
        img_medium: reading.book.media.img_medium,
        img_large: reading.book.media.img_large,
      } : null
    }));
  }

  async findByUserAndBook(user_id: number, book_id: number): Promise<ReadingProgressResponse> {
    const reading = await this.entityManager.findOne(Reading, {
      where: {
        user: { id: user_id },
        book: { id: book_id },
        status: true
      },
      relations: ['book', 'book.media'],
    });

    if (!reading) {
      throw new NotFoundException('Leitura não encontrada');
    }

    return {
      id: reading.book.id,
      title: reading.book.title,
      media: reading.book.media ? {
        id: reading.book.media.id,
        file_url: reading.book.media.file_url,
        img_small: reading.book.media.img_small,
        img_medium: reading.book.media.img_medium,
        img_large: reading.book.media.img_large,
      } : null,
      current_page: reading.current_page,
      progress: reading.progress,
      updated_at: reading.updated_at
    };
  }
} 