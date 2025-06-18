import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserLogsService } from '../services/user-logs.service';

@Controller('users-logs')
@ApiTags('Logs de Login')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class UserLogsController {
  constructor(private readonly userLogsService: UserLogsService) { }

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
        logins_by_day: { type: 'array' },
        total_registers: { type: 'number' },
        successful_registers: { type: 'number' },
        failed_registers: { type: 'number' }
      }
    }
  })
  async getLoginStatistics() {
    return this.userLogsService.getLoginStatistics();
  }
} 