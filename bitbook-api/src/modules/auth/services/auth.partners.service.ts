import { Injectable } from '@nestjs/common';
import { AuthPartnerCpfPayload, SetProviderPayload } from 'src/modules/_legacy/models/providers.models';
import { ProvidersService } from 'src/modules/_legacy/services/providers.service';
import { AuthService } from './auth.service';
import { UpdateUserDto } from 'src/modules/users/dto/user.dto';
import { UsersService } from 'src/modules/users/services/users.service';
import { LoginInfo } from '../interceptors/login-info.interceptor';
import { CheckUserPartnerDto } from '../dto/auth-partners.dto';

@Injectable()
export class AuthPartnersService {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) { }

  async checkClientProvider(provider_id: number, payload: CheckUserPartnerDto): Promise<{
    status: boolean;
    account: boolean;
    message: string;
  }> {
    const response = await this.providersService.checkClientProvider(provider_id, payload)
    const user = await this.userService.findByCpf(payload.chave)

    return {
      status: response.user !== null, // Verifica se o usuário existe no provedor
      account: user !== null, // Verifica se o usuário existe no banco de dados
      message: this.providersService.messageResponse(response.user, user !== null),
    }
  }

  async authPartnerByCpf(payload: AuthPartnerCpfPayload, provider_code: string, loginInfo: LoginInfo) {
    const token = await this.providersService.getTokenUser(payload)

    if (token && token.access_token) {
      const setProviderPayload: SetProviderPayload = {
        cpf: payload.username,
        provedor_codigo: provider_code,
      }

      const response = await this.providersService.setProvider(setProviderPayload, token.access_token)

      if (response.erros === null) {
        const premiumStatus = await this.providersService.getPremiumStatusByToken(token.access_token)

        const user = await this.userService.findByCpf(payload.username)

        if (user) {
          const payloadUpdate: UpdateUserDto = {
            profile: {
              premium: premiumStatus.premium === true,
            }
          }

          await this.userService.update(user.id, payloadUpdate)
          return await this.authService.login(payload.username, payload.password, loginInfo)
        }
      }
    }
  }
}