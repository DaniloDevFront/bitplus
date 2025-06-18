import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { LoginType, LoginStatus } from '../entities/logins-logs.entity';

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

  @ApiProperty({ description: 'Status do login', enum: LoginStatus })
  @IsEnum(LoginStatus)
  success: LoginStatus;

  @ApiProperty({ description: 'Tipo de login', enum: LoginType })
  @IsEnum(LoginType)
  login_type: LoginType;

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
  logins_by_type: Record<LoginType, number>;

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