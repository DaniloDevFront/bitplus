import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { LegacyModule } from '../_legacy/legacy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    UploadsModule, LegacyModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { } 