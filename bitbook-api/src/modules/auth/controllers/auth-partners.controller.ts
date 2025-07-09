import { Controller, Post, Body, Param, Request } from '@nestjs/common';
import { AuthPartnerCpfDto, CheckUserPartnerDto } from '../dto/auth-partners.dto';
import { LoginInfo } from '../interceptors/login-info.interceptor';
import { AuthPartnersService } from '../services/auth.partners.service';

@Controller('auth-partners')
export class AuthPartnersController {
  constructor(private readonly authPartnersService: AuthPartnersService) { }

  @Post("check-user/:provider_id")
  async checkUser(@Param("provider_id") provider_id: number, @Body() body: CheckUserPartnerDto) {
    return await this.authPartnersService.checkClientProvider(provider_id, body);
  }

  @Post('internal')
  async authPartnerInternal(@Body() payload: AuthPartnerCpfDto, @Request() req) {
    const login_info: LoginInfo = req.loginInfo;

    return await this.authPartnersService.authPartnerInternal(payload, login_info);
  }

  @Post('external')
  async authPartnerExternal(@Body() payload: AuthPartnerCpfDto, @Request() req) {
    const login_info: LoginInfo = req.loginInfo;

    return await this.authPartnersService.authPartnerInternal(payload, login_info);
  }
} 