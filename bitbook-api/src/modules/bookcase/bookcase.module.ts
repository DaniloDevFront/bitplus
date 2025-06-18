import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookcase } from './entities/bookcase.entity';
import { BookcaseService } from './services/bookcase.service';
import { BookcaseController } from './controllers/bookcase.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Bookcase])],
  controllers: [BookcaseController],
  providers: [BookcaseService],
  exports: [BookcaseService],
})
export class BookcaseModule { } 