import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { UserLogsService } from '../services/user-logs.service';
import { FindUserLogsDto, UserLogResponseDto, LoginStatisticsDto } from '../dto/user-log.dto';
import { LoginType, LoginStatus } from '../entities/user-log.entity';

@Controller('users/logs')
@ApiTags('Logs de Login')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserLogsController {
  constructor(private readonly userLogsService: UserLogsService) { }

  @Get('today')
  @ApiOperation({ summary: 'Buscar logs de login do dia atual' })
  @ApiResponse({
    status: 200,
    description: 'Logs do dia atual retornados com sucesso',
    type: 'object',
    schema: {
      properties: {
        logs: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserLogResponseDto' }
        },
        total: { type: 'number' }
      }
    }
  })
  @ApiQuery({ name: 'user_id', required: false, type: Number })
  @ApiQuery({ name: 'success', required: false, enum: LoginStatus })
  @ApiQuery({ name: 'login_type', required: false, enum: LoginType })
  @ApiQuery({ name: 'ip_address', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async getTodayLogs(@Query() filters: Partial<FindUserLogsDto>) {
    return this.userLogsService.findTodayLogs(filters);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Buscar logs de login da semana atual' })
  @ApiResponse({
    status: 200,
    description: 'Logs da semana atual retornados com sucesso',
    type: 'object',
    schema: {
      properties: {
        logs: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserLogResponseDto' }
        },
        total: { type: 'number' }
      }
    }
  })
  @ApiQuery({ name: 'user_id', required: false, type: Number })
  @ApiQuery({ name: 'success', required: false, enum: LoginStatus })
  @ApiQuery({ name: 'login_type', required: false, enum: LoginType })
  @ApiQuery({ name: 'ip_address', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async getWeeklyLogs(@Query() filters: Partial<FindUserLogsDto>) {
    return this.userLogsService.findWeeklyLogs(filters);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Buscar logs de login do mês atual' })
  @ApiResponse({
    status: 200,
    description: 'Logs do mês atual retornados com sucesso',
    type: 'object',
    schema: {
      properties: {
        logs: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserLogResponseDto' }
        },
        total: { type: 'number' }
      }
    }
  })
  @ApiQuery({ name: 'user_id', required: false, type: Number })
  @ApiQuery({ name: 'success', required: false, enum: LoginStatus })
  @ApiQuery({ name: 'login_type', required: false, enum: LoginType })
  @ApiQuery({ name: 'ip_address', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async getMonthlyLogs(@Query() filters: Partial<FindUserLogsDto>) {
    return this.userLogsService.findMonthlyLogs(filters);
  }

  @Get('range')
  @ApiOperation({ summary: 'Buscar logs de login por período customizado' })
  @ApiResponse({
    status: 200,
    description: 'Logs do período retornados com sucesso',
    type: 'object',
    schema: {
      properties: {
        logs: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserLogResponseDto' }
        },
        total: { type: 'number' }
      }
    }
  })
  @ApiQuery({ name: 'startDate', required: true, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: true, type: String, example: '2024-01-31' })
  @ApiQuery({ name: 'user_id', required: false, type: Number })
  @ApiQuery({ name: 'success', required: false, enum: LoginStatus })
  @ApiQuery({ name: 'login_type', required: false, enum: LoginType })
  @ApiQuery({ name: 'ip_address', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async getLogsByRange(@Query() filters: FindUserLogsDto) {
    return this.userLogsService.findLogsByDateRange(filters);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obter estatísticas de login' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
    type: 'object',
    schema: {
      properties: {
        total_logins: { type: 'number' },
        successful_logins: { type: 'number' },
        failed_logins: { type: 'number' },
        unique_users: { type: 'number' },
        success_rate: { type: 'number' },
        logins_by_type: { type: 'object' },
        logins_by_day: { type: 'array' }
      }
    }
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2024-01-31' })
  async getLoginStatistics(@Query() filters: Partial<FindUserLogsDto>) {
    return this.userLogsService.getLoginStatistics(filters);
  }

  @Get('suspicious')
  @ApiOperation({ summary: 'Buscar logins suspeitos (múltiplos IPs em curto período)' })
  @ApiResponse({
    status: 200,
    description: 'Logins suspeitos retornados com sucesso',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/UserLogResponseDto' }
    }
  })
  @ApiQuery({ name: 'threshold', required: false, type: Number, example: 5, description: 'Número mínimo de IPs diferentes' })
  async getSuspiciousLogins(@Query('threshold') threshold: number = 5) {
    return this.userLogsService.getSuspiciousLogins(threshold);
  }

  @Get('my-logs')
  @ApiOperation({ summary: 'Buscar logs de login do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Logs do usuário retornados com sucesso',
    type: 'object',
    schema: {
      properties: {
        logs: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserLogResponseDto' }
        },
        total: { type: 'number' }
      }
    }
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async getMyLogs(@Request() req, @Query() filters: Partial<FindUserLogsDto>) {
    const userId = req.user.sub;
    return this.userLogsService.findLogsByDateRange({
      ...filters,
      user_id: userId,
    });
  }
} 