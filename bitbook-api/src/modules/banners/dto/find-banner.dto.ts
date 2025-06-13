import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FindBannerDto {
  @ApiProperty({ description: 'ID do banner', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  id?: number;


  @ApiPropertyOptional({ description: 'Filtrar por banners premium', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  premium?: boolean;

  @ApiProperty({ description: 'ID do provedor', required: false })
  @IsNumber()
  @IsOptional()
  provider_id?: number;
} 