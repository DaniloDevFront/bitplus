import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Banner } from './banner.entity';

@Entity('banner_providers')
export class BannerProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  banner_id: number;

  @Column()
  provider_id: number;

  @Column({ nullable: true, default: "provedor -" })
  provider_name: string;

  @ManyToOne(() => Banner, banner => banner.providers)
  @JoinColumn({ name: 'banner_id' })
  banner: Banner;
} 