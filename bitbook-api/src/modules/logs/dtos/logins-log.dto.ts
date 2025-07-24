import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { LOGIN_TYPE, LOGIN_STATUS } from '../enums/login.enum';

export class CreateUserLogDto {
  @ApiProperty({ description: 'ID do usuário' })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: 'Data e hora do login', example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  login_at: Date;

  @ApiProperty({ description: 'Endereço IP do usuário', required: false })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiProperty({ description: 'User agent do navegador/dispositivo', required: false })
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiProperty({ description: 'Status do login', enum: LOGIN_STATUS })
  @IsEnum(LOGIN_STATUS)
  success: LOGIN_STATUS;

  @ApiProperty({ description: 'Tipo de login', enum: LOGIN_TYPE })
  @IsEnum(LOGIN_TYPE)
  login_type: LOGIN_TYPE;

  @ApiProperty({ description: 'Motivo da falha (se aplicável)', required: false })
  @IsOptional()
  @IsString()
  failure_reason?: string;
}