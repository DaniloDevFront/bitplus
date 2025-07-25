import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Bookcase } from '../../bookcase/entities/bookcase.entity';
import { ContentType } from '../../books/interfaces/ebook.interface';

export interface TopBookcaseBook {
  book: {
    id: number;
    title: string;
    type: ContentType;
  };
  count: number;
}

@Injectable()
export class BookcaseLogsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async getTop5MostFavorited(): Promise<TopBookcaseBook[]> {
    const topBookcases = await this.entityManager
      .createQueryBuilder(Bookcase, 'bookcase')
      .leftJoinAndSelect('bookcase.book', 'book')
      .select([
        'book.id as book_id',
        'book.title as book_title',
        'book.type as book_type',
        'COUNT(bookcase.id) as bookcase_count'
      ])
      .where('bookcase.status = :status', { status: true })
      .groupBy('book.id, book.title, book.type')
      .orderBy('bookcase_count', 'DESC')
      .limit(5)
      .getRawMany();

    return topBookcases.map(item => ({
      book: {
        id: item.book_id,
        title: item.book_title,
        type: item.book_type,
      },
      count: parseInt(item.bookcase_count),
    }));
  }

  async getBookcaseStatistics(): Promise<{
    total: number;
    top_5: TopBookcaseBook[];
  }> {
    // Total de favoritos
    const totalBookcases = await this.entityManager.count(Bookcase);

    // Top 5 mais favoritados
    const top5MostFavorited = await this.getTop5MostFavorited();

    return {
      total: totalBookcases,
      top_5: top5MostFavorited,
    };
  }
} 