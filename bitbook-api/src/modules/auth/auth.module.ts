import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthAdminController } from './controllers/auth-admin.controller';
import { AuthAdminService } from './services/auth-admin.service';
import { LogsModule } from '../logs/logs.module';
import { LegacyModule } from '../_legacy/legacy.module';
import { AuthPartnersController } from './controllers/auth-partners.controller';
import { AuthPartnersService } from './services/auth.partners.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    LogsModule,
    LegacyModule
  ],
  controllers: [AuthController, AuthAdminController, AuthPartnersController],
  providers: [AuthService, AuthAdminService, AuthPartnersService],
  exports: [AuthService, AuthAdminService, AuthPartnersService],
})
export class AuthModule { }
