import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('signatures_plans')
export class SignaturePlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recorrence: string;

  @Column('text')
  description: string;

  @Column()
  price_label: string;

  @Column()
  price: string;
} 