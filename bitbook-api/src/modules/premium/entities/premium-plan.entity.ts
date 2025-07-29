import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Premium } from './premium.entity';

@Entity('premium_plans')
export class PremiumPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'recorrence' })
  recorrence: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'price_label' })
  price_label: string;

  @Column({ name: 'price' })
  price: string;

  @Column({ name: 'id_apple' })
  id_apple: string;

  @Column({ name: 'id_google' })
  id_google: string;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => Premium, premium => premium.plans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'premium_id' })
  premium: Premium;
} 