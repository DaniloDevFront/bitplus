import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Reading } from '../../reading/entities/reading.entity';
import { ContentType } from '../../books/interfaces/ebook.interface';

export interface TopReadingBook {
  book: {
    id: number;
    title: string;
    type: ContentType;
  };
  reading: {
    id: number;
    current_page: number;
    progress: number;
    status: boolean;
  };
}

@Injectable()
export class ReadingsLogsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async getTop5HighProgress(): Promise<TopReadingBook[]> {
    const topReadings = await this.entityManager
      .createQueryBuilder(Reading, 'reading')
      .leftJoinAndSelect('reading.book', 'book')
      .select([
        'book.id as book_id',
        'book.title as book_title',
        'book.type as book_type',
        'AVG(reading.current_page) as reading_current_page',
        'AVG(reading.progress) as reading_progress',
        'reading.status as reading_status',
        'COUNT(reading.id) as reading_count'
      ])
      .where('reading.progress > :progress', { progress: 50 })
      .andWhere('reading.status = :status', { status: true })
      .groupBy('book.id, book.title, book.type, reading.status')
      .orderBy('reading_count', 'DESC')
      .addOrderBy('reading_progress', 'DESC')
      .limit(5)
      .getRawMany();

    return topReadings.map(item => ({
      book: {
        id: item.book_id,
        title: item.book_title,
        type: item.book_type,
      },
      reading: {
        id: 0, // Não temos ID específico quando agrupamos
        current_page: Math.round(item.reading_current_page),
        progress: Math.round(item.reading_progress * 100) / 100,
        status: item.reading_status,
      },
    }));
  }

  async getReadingStatistics(): Promise<{
    total: number;
    high_progress: number;
    low_progress: number;
    top_5: TopReadingBook[];
  }> {
    // Total de leituras
    const totalReadings = await this.entityManager.count(Reading);

    // Leituras com progresso > 50%
    const readingsHighProgress = await this.entityManager
      .createQueryBuilder(Reading, 'reading')
      .where('reading.progress > :progress', { progress: 50 })
      .andWhere('reading.status = :status', { status: true })
      .getCount();

    // Leituras com progresso <= 50%
    const readingsLowProgress = await this.entityManager
      .createQueryBuilder(Reading, 'reading')
      .where('reading.progress <= :progress', { progress: 50 })
      .andWhere('reading.status = :status', { status: true })
      .getCount();

    // Top 5 dos livros com progresso > 50%
    const top5HighProgress = await this.getTop5HighProgress();

    return {
      total: totalReadings,
      high_progress: readingsHighProgress,
      low_progress: readingsLowProgress,
      top_5: top5HighProgress,
    };
  }
} 