import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Signature } from './entities/signature.entity';
import { SignaturePlan } from './entities/signature-plan.entity';

import { services } from './services';
import { controllers } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Signature, SignaturePlan])],
  controllers: [...controllers],
  providers: [...services],
  exports: [...services],
})
export class SignaturesModule { }   