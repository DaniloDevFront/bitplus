import { CoreModule } from './core/core.module';
import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RateModule } from './modules/rate/rate.module';
import { BannersModule } from './modules/banners/banner.module';
import { CategoryModule } from './modules/categories/category.module';
import { BooksModule } from './modules/books/books.module';
import { BookcaseModule } from './modules/bookcase/bookcase.module';
import { ReadingModule } from './modules/reading/reading.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { DocumentationModule } from './modules/documentation/documentation.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
    RateModule,
    BannersModule,
    CategoryModule,
    BooksModule,
    BookcaseModule,
    ReadingModule,
    UploadsModule,
    DocumentationModule
  ],
})
export class AppModule { } 