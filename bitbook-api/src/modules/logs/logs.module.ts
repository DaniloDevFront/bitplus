import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { LoginsLogs } from './entities/logins-logs.entity';
import { RegistrationLog } from './entities/registrations-logs.entity';
import { RateHistory } from '../rate/entities/rate-history.entity';

import { DashboardService } from './services/dashboard.service';
import { LoginsLogsService } from './services/logins-logs.service';
import { RegistrationsLogsService } from './services/registrations-logs.service';
import { RatesService } from './services/rates.service';

import { LoginsLogsController } from './controllers/logs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoginsLogs, RegistrationLog, User, RateHistory]),
  ],
  controllers: [LoginsLogsController],
  providers: [LoginsLogsService, RegistrationsLogsService, DashboardService, RatesService],
  exports: [LoginsLogsService, RegistrationsLogsService, DashboardService, RatesService],
})
export class LogsModule { }   