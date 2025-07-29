import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthAppService } from './services/auth-app.service';
import { AuthAppController } from './controllers/auth-app.controller';
import { UsersModule } from '../users/users.module';
import { AuthAdminController } from './controllers/auth-admin.controller';
import { AuthAdminService } from './services/auth-admin.service';
import { LogsModule } from '../logs/logs.module';
import { LegacyModule } from '../_legacy/legacy.module';
import { AuthPartnersController } from './controllers/auth-partners.controller';
import { AuthPartnersService } from './services/auth.partners.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    LogsModule,
    LegacyModule,
    EmailModule
  ],
  controllers: [AuthAppController, AuthAdminController, AuthPartnersController],
  providers: [AuthAppService, AuthAdminService, AuthPartnersService],
  exports: [AuthAppService, AuthAdminService, AuthPartnersService],
})
export class AuthModule { }
