import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BooksMedia } from './books-media.entity';

@Entity('books_tracks')
export class BookTrack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  audio_url: string; // caminho para o arquivo de áudio da track

  @Column({ default: "00:00:00" })
  duration: string; // duração em formato HH:MM:SS

  @Column({ type: 'int', default: 0 })
  order: number; // ordem da faixa no audiobook

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  cover_small: string; // URL da imagem pequena

  @Column({ type: 'text', nullable: true })
  cover_medium: string; // URL da imagem média

  @Column({ type: 'text', nullable: true })
  cover_large: string; // URL da imagem grande

  @ManyToOne(() => BooksMedia, media => media.tracks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media: BooksMedia;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 