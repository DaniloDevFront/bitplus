import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthAdminController } from './controllers/auth-admin.controller';
import { AuthAdminService } from './services/auth-admin.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
  controllers: [AuthController, AuthAdminController],
  providers: [AuthService, AuthAdminService],
  exports: [AuthService, AuthAdminService],
})
export class AuthModule { }
