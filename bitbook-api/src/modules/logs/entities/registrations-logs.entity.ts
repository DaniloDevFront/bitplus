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
export class RegistrationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  failure_reason?: string;

  @Column()
  ip_address: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;
}