import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ default: false })
  premium: boolean;

  @Column({ nullable: true })
  provider_id: number;

  @Column({ default: UserRole.CLIENT })
  role: UserRole;

  @Column({ default: false })
  terms: boolean;

  @Column({ nullable: true })
  @Exclude()
  biometricSecretHash: string;

  @Column({ default: false })
  isBiometricEnabled: boolean;

  @Column({ nullable: true, default: null })
  subscription_login: string;

  @Column({ nullable: true, default: null })
  subscription_id: string;

  @Column({ default: false })
  legacy: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Profile, profile => profile.user, {
    cascade: true,
    eager: true
  })
  profile: Profile;
}
