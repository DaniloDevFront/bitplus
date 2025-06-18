import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BannerProvider } from './banner-provider.entity';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  banner: string;

  @Column({ default: false })
  premium: boolean;

  @Column({ nullable: true })
  action_internal?: string;

  @Column({ nullable: true })
  action_external?: string;

  @OneToMany(() => BannerProvider, bannerProvider => bannerProvider.banner)
  providers: BannerProvider[];
} 