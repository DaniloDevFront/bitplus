import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Bookcase } from '../entities/bookcase.entity';
import { CreateBookcaseDto } from '../dto/create-bookcase.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { Books } from '../../books/entities/books.entity';

@Injectable()
export class BookcaseService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async create(payload: CreateBookcaseDto): Promise<Bookcase> {
    return this.entityManager.transaction(async (manager) => {
      // Verifica se o livro existe
      const book = await manager.findOne(Books, {
        where: { id: payload.book_id }
      });

      if (!book) {
        throw new NotFoundException(`Livro com ID ${payload.book_id} não encontrado`);
      }

      // Verifica se o livro já está na estante do usuário
      const existingBookcase = await manager.findOne(Bookcase, {
        where: {
          user_id: payload.user_id,
          book_id: payload.book_id,
          status: true
        }
      });

      if (existingBookcase) {
        throw new ConflictException('Este livro já está na sua estante');
      }

      // Cria a estante
      const bookcase = manager.create(Bookcase, payload);
      return manager.save(bookcase);
    });
  }

  async delete(book_id: number, user_id: number): Promise<void> {
    const bookcase = await this.entityManager.findOne(Bookcase, {
      where: { book_id, user_id }
    });

    if (!bookcase) {
      throw new NotFoundException(`Livro não encontrado na estante do usuário`);
    }

    await this.entityManager.remove(bookcase);
  }

  async findByUser(user_id: number): Promise<any[]> {
    const user = await this.entityManager.findOne(User, {
      where: { id: user_id }
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${user_id} não encontrado`);
    }

    const bookcases = await this.entityManager.find(Bookcase, {
      where: { user_id },
      relations: ['book', 'book.category', 'book.media'],
      order: { created_at: 'DESC' }
    });

    // Agrupar livros por categoria
    const groupedByCategory = bookcases.reduce((acc, bookcase) => {
      if (!bookcase.book || !bookcase.book.category) {
        return acc;
      }

      const categoryId = bookcase.book.category.id;
      const categoryName = bookcase.book.category.name;

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

      // Adicionar o livro ao grupo da categoria
      categoryGroup.books.push({
        id: bookcase.book.id,
        title: bookcase.book.title,
        media: bookcase.book.media ? {
          id: bookcase.book.media.id,
          file_url: bookcase.book.media.file_url,
          img_small: bookcase.book.media.img_small,
          img_medium: bookcase.book.media.img_medium,
          img_large: bookcase.book.media.img_large,
        } : null,
        premium: bookcase.book.premium
      });

      return acc;
    }, []);

    return groupedByCategory;
  }
} 