import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Books } from '../../books/entities/books.entity';

@Entity('bookcases')
export class Bookcase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  book_id: number;

  @Column({ nullable: true })
  audiobook_id: number;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Books)
  @JoinColumn({ name: 'book_id' })
  book: Books;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 