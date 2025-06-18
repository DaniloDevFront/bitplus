import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { LoginType, LoginStatus } from '../entities/user-log.entity';

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

export class FindStatisticsDto {
  @ApiProperty({ description: 'Data inicial (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ description: 'Data final (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class LoginStatisticsDto {
  @ApiProperty({ description: 'Total de logins no período' })
  total_logins: number;

  @ApiProperty({ description: 'Logins bem-sucedidos' })
  successful_logins: number;

  @ApiProperty({ description: 'Logins falhados' })
  failed_logins: number;

  @ApiProperty({ description: 'Usuários únicos que fizeram login' })
  unique_users: number;

  @ApiProperty({ description: 'Taxa de sucesso (%)' })
  success_rate: number;

  @ApiProperty({ description: 'Logins por tipo', type: 'object' })
  logins_by_type: Record<LoginType, number>;

  @ApiProperty({ description: 'Logins por dia', type: 'array' })
  logins_by_day: Array<{
    date: string;
    count: number;
  }>;

  @ApiProperty({ description: 'Registros de usuários por dia', type: 'array' })
  registers_by_day: Array<{
    date: string;
    count: number;
  }>;
} 