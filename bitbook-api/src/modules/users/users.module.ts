import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { UserLog } from './entities/user-log.entity';
import { UsersService } from './services/users.service';
import { UserLogsService } from './services/user-logs.service';
import { UsersController } from './controllers/users.controller';
import { UserLogsController } from './controllers/user-logs.controller';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, UserLog]),
    UploadsModule,
  ],
  controllers: [UsersController, UserLogsController],
  providers: [UsersService, UserLogsService],
  exports: [UsersService, UserLogsService],
})
export class UsersModule { } 