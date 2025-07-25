import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateErrorLogDto {
  @ApiProperty({ description: 'Mensagem do erro' })
  @IsString()
  error_message: string;

  @ApiProperty({ description: 'Stack trace do erro', required: false })
  @IsOptional()
  @IsString()
  error_stack?: string;

  @ApiProperty({ description: 'Origem do erro (ex: controller, service)', required: false })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiProperty({ description: 'Tipo do erro (ex: ValidationError, NotFoundException)', required: false })
  @IsOptional()
  @IsString()
  error_type?: string;

  @ApiProperty({ description: 'Endereço IP do usuário', required: false })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiProperty({ description: 'User agent do navegador/dispositivo', required: false })
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiProperty({ description: 'ID do usuário (se autenticado)', required: false })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({ description: 'Dados da requisição (body, params, query)', required: false })
  @IsOptional()
  request_data?: any;
} 