import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsModule } from '../uploads/uploads.module';

import { LoginsLogs } from './entities/logins-logs.entity';
import { RegistrationLog } from './entities/registrations-logs.entity';
import { LoginsLogsService } from './services/logins-logs.service';
import { RegistrationsLogsService } from './services/registrations-logs.service';
import { LoginsLogsController } from './controllers/logs.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoginsLogs, RegistrationLog, User]),
    UploadsModule,
  ],
  controllers: [LoginsLogsController],
  providers: [LoginsLogsService, RegistrationsLogsService],
  exports: [LoginsLogsService, RegistrationsLogsService],
})
export class LogsModule { } 