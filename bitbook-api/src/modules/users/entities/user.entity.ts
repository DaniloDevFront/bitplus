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

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  premium: boolean;

  @Column({ default: UserRole.CLIENT })
  role: UserRole;

  @Column({ default: false })
  terms: boolean;

  @Column({ nullable: true })
  @Exclude()
  biometricSecretHash: string;

  @Column({ default: false })
  isBiometricEnabled: boolean;

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
