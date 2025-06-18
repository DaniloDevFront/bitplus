import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Books } from './books.entity';

@Entity('books_sheets')
export class BooksSheet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author: string;

  @Column()
  genre: string;

  @Column()
  year: number;

  @Column()
  ref: string;

  @OneToOne(() => Books, books => books.sheet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'books_id' })
  book: Books;
} 