import { PartialType } from '@nestjs/swagger';
import { CreateBooksMediaDto } from './create-books-media.dto';

export class UpdateBooksMediaDto extends PartialType(CreateBooksMediaDto) { } 