import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, unique: true })
  cpf: string;

  @Column({ nullable: true, type: 'date' })
  birth_date: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, default: "https://bitplus.s3.sa-east-1.amazonaws.com/default/cover-profile.png" })
  cover: string;

  @Column({ nullable: true })
  provider_id: number;

  @OneToOne(() => User, user => user.profile, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @AfterLoad()
  formatBirthDate() {
    if (this.birth_date) {
      const [year, month, day] = this.birth_date.split('-');
      this.birth_date = `${day}/${month}/${year}`;
    }
  }
}
