import { Controller, Post, Body, Param, Request } from '@nestjs/common';
import { AuthPartnerCpfDto, CheckUserPartnerDto } from '../dto/auth-partners.dto';
import { LoginInfo } from '../interceptors/login-info.interceptor';
import { AuthPartnersService } from '../services/auth.partners.service';


@Controller('auth-partners')
export class AuthPartnersController {
  constructor(private readonly authPartnersService: AuthPartnersService) { }

  @Post("check-user/:provider_id")
  async checkUser(@Param("provider_id") provider_id: number, @Body() body: CheckUserPartnerDto) {
    return this.authPartnersService.checkClientProvider(provider_id, body);
  }

  @Post()
  async authPartner(@Body() body: AuthPartnerCpfDto, @Request() req) {
    const payload = {
      client_id: 2,
      client_secret: "k0c4FSsWoY94NQNYqci8fd5mGrcaJgjH5KCXfevK",
      grant_type: "password",
      username: body.username,
      password: body.password,
    }
    const loginInfo: LoginInfo = req.loginInfo;

    return this.authPartnersService.authPartnerByCpf(payload, body.provider_code, loginInfo);
  }
} 