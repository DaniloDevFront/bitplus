import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PremiumPlan } from './premium-plan.entity';

@Entity('premium')
export class Premium {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'status', default: true })
  status: boolean;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'benefits', type: 'simple-array', nullable: false })
  benefits: string[];

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => PremiumPlan, plan => plan.premium, { onDelete: 'CASCADE' })
  plans: PremiumPlan[];
} 