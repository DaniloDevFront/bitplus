import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserLogsService } from '../services/user-logs.service';
import { FindTodayLogsDto, FindStatisticsDto } from '../dto/user-log.dto';
import { LoginType, LoginStatus } from '../entities/user-log.entity';

@Controller('users/logs')
@ApiTags('Logs de Login')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
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
  async getTodayLogs(@Query() filters: Partial<FindTodayLogsDto>) {
    return this.userLogsService.findTodayLogs(filters);
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
  @ApiQuery({ name: 'start_date', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'end_date', required: false, type: String, example: '2024-01-31' })
  async getLoginStatistics(@Query() filters: Partial<FindStatisticsDto>) {
    return this.userLogsService.getLoginStatistics(filters);
  }
} 