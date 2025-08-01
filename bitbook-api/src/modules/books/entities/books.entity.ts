import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BooksSheet } from './book-sheet.entity';
import { Category } from '../../categories/entities/category.entity';
import { ContentType } from '../interfaces/ebook.interface';
import { BooksMedia } from './books-media.entity';

@Entity('books')
export class Books {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: false })
  premium: boolean;

  @Column({ default: false })
  high: boolean;

  @Column({ default: false })
  landpage: boolean;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.EBOOK
  })
  type: ContentType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToOne(() => BooksSheet, sheet => sheet.book, { cascade: true, onDelete: 'CASCADE' })
  sheet: BooksSheet;

  @OneToOne(() => BooksMedia, media => media.book, { cascade: true, onDelete: 'CASCADE' })
  media: BooksMedia;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 