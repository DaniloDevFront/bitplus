import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Books } from './books.entity';
import { BookTrack } from './book-track.entity';

@Entity('books_media')
export class BooksMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  file_url: string; // URL do PDF (apenas para ebooks, null para audiobooks)

  @Column({ nullable: true })
  img_small: string; // Capa pequena (obrigatória para ambos)

  @Column({ nullable: true })
  img_medium: string; // Capa média (obrigatória para ambos)

  @Column({ nullable: true })
  img_large: string; // Capa grande (obrigatória para ambos)

  @OneToOne(() => Books, books => books.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'books_id' })
  book: Books;

  @OneToMany(() => BookTrack, track => track.media, { cascade: true, nullable: true })
  tracks: BookTrack[]; // Apenas para audiobooks, null para ebooks

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 