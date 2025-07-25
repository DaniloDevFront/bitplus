import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('errors_logs')
@Index(['created_at'])
@Index(['origin'])
@Index(['error_type'])
export class ErrorsLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  error_message: string;

  @Column({ type: 'text', nullable: true })
  error_stack?: string;

  @Column({ nullable: true })
  origin: string;

  @Column({ nullable: true })
  error_type: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  user_agent: string;

  @Column({ nullable: true })
  user_id?: number;

  @Column({ type: 'json', nullable: true })
  request_data?: any;

  @CreateDateColumn()
  created_at: Date;
} 