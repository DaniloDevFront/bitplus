import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';

@Controller('logs')
@ApiTags('Logs de Login')
export class LoginsLogsController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) { }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter estatísticas de login' })
  async getLoginStatistics() {
    return this.dashboardService.getDashboard();
  }
} 