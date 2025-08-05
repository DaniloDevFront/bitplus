import { Injectable, NotFoundException } from '@nestjs/common';
import { ProvidersService } from 'src/modules/_legacy/services/providers.service';
import { AuthAppService } from './auth-app.service';
import { UpdateUserDto } from 'src/modules/users/dto/user.dto';
import { UsersService } from 'src/modules/users/services/users.service';
import { LoginInfo } from '../interceptors/login-info.interceptor';
import { AuthPartnerCpfDto, AuthPartnerExternalDto, CheckUserPartnerDto } from '../dto/auth-partners.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { UserRole } from 'src/modules/users/enums/user-role.enum';
@Injectable()
export class AuthPartnersService {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly authService: AuthAppService,
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
      status: response.user !== null || response.user_found, // Verifica se o usuário existe no provedor
      account: user !== null, // Verifica se o usuário existe no banco de dados
      message: this.providersService.messageResponse((response.user || response.user_found), (user !== null)),
    }
  }

  async authPartnerInternal(payload: AuthPartnerCpfDto, loginInfo: LoginInfo) {
    const { login, password } = payload
    let user: User

    if (payload.login.includes('@')) {
      user = await this.userService.findByEmail(payload.login)
    } else {
      user = await this.userService.findByCpf(payload.login)
    }

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    const response = await this.providersService.checkPremiumStatus(payload.provider_id, user.profile.cpf)

    if (!response) {
      throw new NotFoundException('Erro ao verificar status premium')
    }

    const update: UpdateUserDto = {
      provider_id: response.empresa.id,
      premium: response.cliente.premium,
    }

    await this.userService.update(user.id, update)

    return await this.authService.login(login, password, loginInfo)
  }

  async authPartnerExternal(payload: AuthPartnerExternalDto, loginInfo: LoginInfo) {
    const response = await this.providersService.checkPartnerExternal(payload)

    const { authentication, authorization } = response

    if (authentication.error) {
      throw new NotFoundException(authentication.message)
    }

    if (authorization.error) {
      throw new NotFoundException(authorization.message)
    }

    if (!authorization.success) {
      return {
        status: false,
        account: false,
        message: "Você não está liberado no provedor. Sua assinatura pode estar expirada ou não estar ativa. Verifique sua assinatura no provedor."
      }
    }

    const user = await this.userService.findBySubscriptionLogin(payload.login)

    if (!user) {
      await this.userService.createExternal({
        subscription_login: payload.login,
        subscription_id: authentication.subscriberId,
        provider_id: payload.provider_id,
      })
    } else {
      const update: UpdateUserDto = {
        provider_id: payload.provider_id,
        premium: true,
        subscription_id: authentication.subscriberId,
        subscription_login: payload.login,
      }

      await this.userService.update(user.id, update)
    }

    return await this.authService.login(payload.login, payload.password, loginInfo, true)
  }
}