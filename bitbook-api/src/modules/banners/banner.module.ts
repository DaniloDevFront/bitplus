import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { BannerProvider } from './entities/banner-provider.entity';
import { BannerService } from './services/banner.service';
import { BannerController } from './controllers/banner.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, BannerProvider, User]), UploadsModule],
  controllers: [BannerController],
  providers: [BannerService],
  exports: [BannerService],
})
export class BannersModule { } 