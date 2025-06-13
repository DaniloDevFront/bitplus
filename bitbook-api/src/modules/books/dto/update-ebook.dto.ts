import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEbookDto } from './create-ebook.dto';
import { IsOptional } from 'class-validator';
import { IsNumber } from 'class-validator';
import { IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEbookDto extends PartialType(CreateEbookDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(v => Number(v));
    }
    if (typeof value === 'string') {
      return [Number(value)];
    }
    return value;
  })
  remove_tracks?: number[];
} 