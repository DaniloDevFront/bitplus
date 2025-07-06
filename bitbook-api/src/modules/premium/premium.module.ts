import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Premium } from './entities/premium.entity';
import { PremiumPlan } from './entities/premium-plan.entity';

import { services } from './services';
import { controllers } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Premium, PremiumPlan])],
  controllers: [...controllers],
  providers: [...services],
  exports: [...services],
})
export class PremiumModule { }   