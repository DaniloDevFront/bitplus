import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { CheckClientPayload, CheckClientResponse, ProviderResponse } from '../models/providers.models';
import { AuthPartnerExternalDto } from 'src/modules/auth/dto/auth-partners.dto';

const BASE_URL = "https://api-bitbook.bitplus.app.br"

@Injectable()
export class ProvidersService {
  constructor(
    private readonly httpService: HttpService,
  ) { }

  async findAllProviders(): Promise<any> {
    const url = `${BASE_URL}/api/empresas-integracoes`

    try {
      const responseLegacy: AxiosResponse<ProviderResponse> = await firstValueFrom(this.httpService.get<ProviderResponse>(url))

      const response = responseLegacy.data.empresas.map((provider) => {
        return {
          id: provider.id,
          name: provider.nome,
          img: provider.img_lista,
          method: this.getMethod(provider.campo_vinculacao),
        }
      })

      return response;
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.resposta || 'Erro ao buscar provedores'
      );
    }

  }

  async checkClientProvider(provider_id: number, payload: CheckClientPayload): Promise<CheckClientResponse> {
    const url = `${BASE_URL}/api/empresas/${provider_id}/verifica-cliente`

    try {
      const response: AxiosResponse<CheckClientResponse> = await firstValueFrom(this.httpService.post(url, payload))
      return response.data

    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.resposta || 'Erro ao verificar cliente'
      );
    }
  }

  async checkPremiumStatus(provider_id: number, chave: string): Promise<any> {
    const url = `${BASE_URL}/api/empresas/${provider_id}/premium`

    try {
      const response: AxiosResponse<any> = await firstValueFrom(this.httpService.post(url, { chave: chave }))

      return response.data
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.resposta || 'Erro ao obter status premium'
      );
    }
  }

  async findProvider(provider_id: number): Promise<any> {
    const url = `${BASE_URL}/api/empresas/${provider_id}`

    try {
      const response: AxiosResponse<any> = await firstValueFrom(this.httpService.get(url))

      return response.data
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.resposta || 'Erro ao buscar provedor'
      );
    }
  }

  async checkPartnerExternal(payload: AuthPartnerExternalDto) {

    const data = {
      username: payload.login,
      password: payload.password,
    }

    const url = `${BASE_URL}/api/passive/${payload.provider_id}/authentication`

    try {
      const response: AxiosResponse<any> = await firstValueFrom(this.httpService.post(url, data))

      const authorization = await this.getAuthorizationUserExternal(payload.provider_id, response.data.subscriberId)

      return {
        authorization,
        authentication: {
          ...response.data
        }
      }
    } catch (error: any) {

      throw new BadRequestException(
        error.response?.data?.resposta || 'Erro ao autenticar parceiro externo'
      );
    }
  }

  async getAuthorizationUserExternal(provider_id: number, subscription_id: string) {
    const url = `${BASE_URL}/api/passive/${provider_id}/authorization`

    const payload = {
      empresa_id: provider_id,
      subscriberId: subscription_id
    }

    try {
      const response: AxiosResponse<any> = await firstValueFrom(this.httpService.post(url, payload))
      return response.data

    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.resposta || 'Erro ao autenticar parceiro externo'
      );
    }
  }

  /**
   * Auxiliary methods
   */
  private getMethod(method: string): string {
    switch (method) {
      case "cpf":
        return "cpf";
      case "subscriberId":
        return "login";
    }
  }

  messageResponse(user_id: number | boolean, user_found: boolean): string {
    // usuario liberado no provedor e possui conta no banco de dados
    if (user_id && user_found) {
      return "Encontramos sua conta e está liberado no provedor. Agora é só fazer login.";
    }

    // usuario liberado no provedor e não possui conta no banco de dados
    if (user_id && !user_found) {
      return "Você está liberado no provedor, mas não possui uma conta. Prossiga com o registro.";
    }

    // usuario nao liberado no provedor e não possui conta no banco de dados
    if (!user_id && !user_found) {
      return "Você não está liberado no provedor e não encontramos sua conta. Poderá continuar, mas sem acesso premium. Prossiga com o registro.";
    }

    // usuario nao liberado no provedor e possui conta no banco de dados
    if (!user_id && user_found) {
      return "Encontramos sua conta, mas não está liberado no provedor. Será possível prosseguir com o login, porém sem acesso premium.";
    }

    return "Erro ao verificar cliente"
  }
}