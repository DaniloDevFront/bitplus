import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateRegistrationLogDto {
  @ApiProperty({ description: 'Email do usuário tentando se registrar' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Endereço IP do usuário', required: false })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiProperty({ description: 'User agent do navegador/dispositivo', required: false })
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiProperty({ description: 'Motivo da falha (se aplicável)', required: false })
  @IsOptional()
  @IsString()
  failure_reason?: string;
}

export class RegistrationStatisticsDto {
  @ApiProperty({ description: 'Total de tentativas de registro no período' })
  total_registrations: number;

  @ApiProperty({ description: 'Registros bem-sucedidos' })
  successful_registrations: number;

  @ApiProperty({ description: 'Registros falhados' })
  failed_registrations: number;

  @ApiProperty({ description: 'Registros do dia', type: 'object' })
  registrations_by_day: {
    date: string;
    count: number;
  };

  @ApiProperty({ description: 'Top emails com mais tentativas falhadas', type: 'array' })
  top_failed_emails: Array<{
    email: string;
    attempts: number;
  }>;
} 