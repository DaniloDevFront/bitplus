import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { LoginsLogs } from './entities/logins-logs.entity';
import { RegistrationLog } from './entities/registrations-logs.entity';
import { ErrorsLogs } from './entities/errors-logs.entity';
import { RateHistory } from '../rate/entities/rate-history.entity';
import { Reading } from '../reading/entities/reading.entity';
import { Books } from '../books/entities/books.entity';
import { Bookcase } from '../bookcase/entities/bookcase.entity';

import { DashboardService } from './services/dashboard.service';
import { LoginsLogsService } from './services/logins-logs.service';
import { RegistrationsLogsService } from './services/registrations-logs.service';
import { ErrorsLogsService } from './services/errors-logs.service';
import { ReadingsLogsService } from './services/readings-logs.service';
import { BookcaseLogsService } from './services/bookcase-logs.service';
import { RatesService } from './services/rates.service';
import { LoginsLogsController } from './controllers/logs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoginsLogs, RegistrationLog, ErrorsLogs, User, RateHistory, Reading, Books, Bookcase]),
  ],
  controllers: [LoginsLogsController],
  providers: [LoginsLogsService, RegistrationsLogsService, ErrorsLogsService, ReadingsLogsService, BookcaseLogsService, DashboardService, RatesService],
  exports: [LoginsLogsService, RegistrationsLogsService, ErrorsLogsService, ReadingsLogsService, BookcaseLogsService, DashboardService, RatesService],
})
export class LogsModule { }   