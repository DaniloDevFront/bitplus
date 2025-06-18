import { IsString, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateBannerDto {
  @ApiProperty({ description: 'Banner' })
  @IsString()
  @IsOptional()
  banner?: string;

  @ApiProperty({ description: 'Indica se o banner é premium', default: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  premium?: boolean;

  @ApiProperty({ description: 'IDs dos provedores', required: false, type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(v => Number(v));
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(v => Number(v)) : [];
      } catch {
        return [];
      }
    }
    return [];
  })
  provider_ids?: number[];

  @ApiProperty({ description: 'Ação interna do app', required: false })
  @IsString()
  @IsOptional()
  action_internal?: string;

  @ApiProperty({ description: 'Ação externa do app', required: false })
  @IsString()
  @IsOptional()
  action_external?: string;
} 