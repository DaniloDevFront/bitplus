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

export class LoginStatisticsDto {
  @ApiProperty({ description: 'Total de logins no período' })
  total_logins: number;

  @ApiProperty({ description: 'Logins bem-sucedidos' })
  successful_logins: number;

  @ApiProperty({ description: 'Logins falhados' })
  failed_logins: number;

  @ApiProperty({ description: 'Logins por tipo', type: 'object' })
  logins_by_type: Record<LOGIN_TYPE, number>;

  @ApiProperty({ description: 'Logins do dia', type: 'object' })
  logins_by_day: {
    date: string;
    count: number;
  };

  @ApiProperty({ description: 'Registros de usuários do dia', type: 'object' })
  registers_by_day: {
    date: string;
    count: number;
  };

  @ApiProperty({ description: 'Total de registros no período' })
  total_registers: number;

  @ApiProperty({ description: 'Registros falhados' })
  failed_registers: number;
} 