import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Rate } from './entities/rate.entity';
import { RateHistory } from './entities/rate-history.entity';
import { RateController } from './rate.controller';
import { RateService } from './rate.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rate, RateHistory])],
  controllers: [RateController],
  providers: [RateService],
  exports: [RateService],
})
export class RateModule { } 