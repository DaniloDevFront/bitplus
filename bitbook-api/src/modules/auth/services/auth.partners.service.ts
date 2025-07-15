import { Injectable, NotFoundException } from '@nestjs/common';
import { ProvidersService } from 'src/modules/_legacy/services/providers.service';
import { AuthAppService } from './auth-app.service';
import { UpdateUserDto } from 'src/modules/users/dto/user.dto';
import { UsersService } from 'src/modules/users/services/users.service';
import { LoginInfo } from '../interceptors/login-info.interceptor';
import { AuthPartnerCpfDto, CheckUserPartnerDto } from '../dto/auth-partners.dto';
import { User } from 'src/modules/users/entities/user.entity';

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
      status: response.user !== null, // Verifica se o usuário existe no provedor
      account: user !== null, // Verifica se o usuário existe no banco de dados
      message: this.providersService.messageResponse(response.user, (user !== null)),
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

    const response = await this.providersService.checkClientProvider(payload.provider_id, { chave: user.profile.cpf })

    if (!response.user_found || response.user !== user.id) {
      throw new NotFoundException('Usuário não pertence ao provedor')
    }

    const update: UpdateUserDto = {
      provider_id: response.empresa.id,
      premium: response.user_found,
    }

    await this.userService.update(user.id, update)

    return await this.authService.login(login, password, loginInfo)
  }
}