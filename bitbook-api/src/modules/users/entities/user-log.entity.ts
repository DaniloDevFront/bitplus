import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum LoginType {
  EMAIL_PASSWORD = 'email_password',
  BIOMETRIC = 'biometric',
  SOCIAL = 'social',
  REFRESH_TOKEN = 'refresh_token',
}

export enum LoginStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('user_logs')
@Index(['user_id', 'login_at'])
@Index(['login_at'])
@Index(['ip_address'])
@Index(['success'])
export class UserLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ type: 'timestamp', name: 'login_at' })
  login_at: Date;

  @Column({ name: 'ip_address', nullable: true })
  ip_address: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  user_agent: string;

  @Column({
    type: 'enum',
    enum: LoginStatus,
    default: LoginStatus.SUCCESS,
  })
  success: LoginStatus;

  @Column({
    type: 'enum',
    enum: LoginType,
    default: LoginType.EMAIL_PASSWORD,
  })
  login_type: LoginType;

  @Column({ nullable: true })
  failure_reason: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
} 