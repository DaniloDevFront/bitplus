import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('registration_logs')
export class RegistrationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  user_id?: number;

  @Column()
  success: boolean;

  @Column({ nullable: true })
  failure_reason?: string;

  @Column()
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;
}