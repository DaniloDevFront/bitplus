import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../entities/banner.entity';
import { BannerProvider } from '../entities/banner-provider.entity';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { UploadsService } from '../../uploads/uploads.service';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(BannerProvider)
    private readonly bannerProviderRepository: Repository<BannerProvider>,
    private readonly uploadsService: UploadsService,
  ) { }

  async create(payload: CreateBannerDto, file: Express.Multer.File): Promise<Banner> {
    if (payload.provider_ids) {
      if (typeof payload.provider_ids === 'string') {
        try {
          payload.provider_ids = JSON.parse(payload.provider_ids);
        } catch {
          payload.provider_ids = [];
        }
      }
      if (!Array.isArray(payload.provider_ids)) {
        payload.provider_ids = [];
      }
      payload.provider_ids = payload.provider_ids.map(id => Number(id));
    }

    const banner = this.bannerRepository.create(payload);

    const uploadResult = await this.uploadsService.uploadFile(file, 'bannersTeste', 'image');

    if (uploadResult) {
      banner.banner = uploadResult.url;
    }

    const savedBanner = await this.bannerRepository.save(banner);

    if (payload.provider_ids && payload.provider_ids.length > 0) {
      const bannerProviders = payload.provider_ids.map(providerId => {
        const bannerProvider = new BannerProvider();
        bannerProvider.banner_id = savedBanner.id;
        bannerProvider.provider_id = providerId;
        return bannerProvider;
      });

      await this.bannerProviderRepository.save(bannerProviders);
    }

    return this.findById(savedBanner.id);
  }

  async update(id: number, payload: UpdateBannerDto, file: Express.Multer.File): Promise<Banner> {

    // Garantir que provider_ids seja um array de números
    if (payload.provider_ids) {
      if (typeof payload.provider_ids === 'string') {
        try {
          payload.provider_ids = JSON.parse(payload.provider_ids);
        } catch {
          payload.provider_ids = [];
        }
      }
      if (!Array.isArray(payload.provider_ids)) {
        payload.provider_ids = [];
      }
      payload.provider_ids = payload.provider_ids.map(id => Number(id));
    }


    const banner = await this.findById(id);

    if (!banner) {
      throw new NotFoundException(`Banner com ID ${id} não encontrado`);
    }

    if (file) {
      const uploadResult = await this.uploadsService.uploadFile(file, 'bannersTeste', 'image');

      if (uploadResult) {
        if (banner.banner) {
          await this.uploadsService.deleteFile(banner.banner);
        }

        banner.banner = uploadResult.url;
      }
    }

    Object.assign(banner, payload);
    const updatedBanner = await this.bannerRepository.save(banner);

    if (payload.provider_ids) {
      // Remove existing provider relationships
      await this.bannerProviderRepository.delete({ banner_id: id });

      // Create new provider relationships
      if (payload.provider_ids.length > 0) {
        const bannerProviders = payload.provider_ids.map(providerId => {
          const bannerProvider = new BannerProvider();
          bannerProvider.banner_id = id;
          bannerProvider.provider_id = providerId;
          return bannerProvider;
        });

        await this.bannerProviderRepository.save(bannerProviders);
      }
    }

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const banner = await this.findById(id);

    if (!banner) {
      throw new NotFoundException(`Banner com ID ${id} não encontrado`);
    }

    if (banner.banner) {
      await this.uploadsService.deleteFile(banner.banner);
    }

    // Remove provider relationships
    await this.bannerProviderRepository.delete({ banner_id: id });

    await this.bannerRepository.remove(banner);
  }

  async findAll(): Promise<Banner[]> {
    return this.bannerRepository.find({
      relations: ['providers'],
    });
  }

  async findById(id: number): Promise<Banner> {
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: ['providers'],
    });

    if (!banner) {
      throw new NotFoundException(`Banner com ID ${id} não encontrado`);
    }
    return banner;
  }

  async findByPremium(premium: boolean): Promise<Banner[]> {
    return this.bannerRepository.find({
      where: { premium },
      relations: ['providers'],
    });
  }

  async findByProvider(provider_id: number): Promise<Banner[]> {
    const bannerProviders = await this.bannerProviderRepository.find({
      where: { provider_id },
      relations: ['banner'],
    });

    return bannerProviders.map(bp => bp.banner);
  }
} 