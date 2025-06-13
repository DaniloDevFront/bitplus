import { Module } from '@nestjs/common';
import { BooksService } from './services/books.service';
import { BooksController } from './controllers/books.controller';
import { ReadingModule } from '../reading/reading.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Books } from './entities/books.entity';
import { BooksSheet } from './entities/book-sheet.entity';
import { UploadsModule } from '../uploads/uploads.module';
import { BooksMedia } from './entities/books-media.entity';
import { BookTrack } from './entities/book-track.entity';
import { BooksMediaHelper } from './helpers/books-media.helper';
import { AudiobooksController } from './controllers/audiobooks.controller';
import { AudiobooksService } from './services/audiobooks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Books, BooksSheet, BooksMedia, BookTrack]),
    ReadingModule,
    UploadsModule
  ],
  controllers: [BooksController, AudiobooksController],
  providers: [BooksService, BooksMediaHelper, AudiobooksService],
  exports: [BooksService, AudiobooksService]
})
export class BooksModule { } 