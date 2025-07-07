import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LOGIN_STATUS, LOGIN_TYPE } from '../enums/login.enum';


@Entity('logins_logs')
@Index(['user_id', 'login_at'])
@Index(['login_at'])
@Index(['ip_address'])
@Index(['success'])
export class LoginsLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  user_id: number;

  @Column({ type: 'timestamp', name: 'login_at' })
  login_at: Date;

  @Column({ name: 'ip_address', nullable: true })
  ip_address: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  user_agent: string;

  @Column({
    type: 'enum',
    enum: LOGIN_STATUS,
    default: LOGIN_STATUS.SUCCESS,
  })
  success: LOGIN_STATUS;

  @Column({
    type: 'enum',
    enum: LOGIN_TYPE,
    default: LOGIN_TYPE.EMAIL_PASSWORD,
  })
  login_type: LOGIN_TYPE;

  @Column({ nullable: true })
  failure_reason: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
} 