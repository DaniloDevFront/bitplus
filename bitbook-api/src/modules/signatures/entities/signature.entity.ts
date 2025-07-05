import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SignaturePlan } from './signature-plan.entity';

@Entity('signatures')
export class Signature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  status: boolean;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array', { nullable: false })
  benefits: string[];

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => SignaturePlan, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'plan_id' })
  plan: SignaturePlan;
} 