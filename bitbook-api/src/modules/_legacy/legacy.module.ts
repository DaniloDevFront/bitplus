import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { services } from './services';
import { controllers } from './controllers';

@Module({
  imports: [HttpModule],
  controllers: [...controllers],
  providers: [...services],
  exports: [...services],
})
export class LegacyModule { } 