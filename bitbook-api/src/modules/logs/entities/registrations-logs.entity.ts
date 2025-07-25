import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('registration_logs')
@Index(['ip_address'])
@Index(['created_at'])
@Index(['status'])
export class RegistrationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  failure_reason?: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  user_agent: string;

  @Column({
    type: 'enum',
    enum: ['success', 'failed'],
    default: 'success',
  })
  status: 'success' | 'failed';

  @CreateDateColumn()
  created_at: Date;
}