import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { AuthPartnerCpfPayload, AuthPartnerCpfResponse, CheckClientPayload, CheckClientResponse, ProviderResponse, SetProviderPayload } from '../models/providers.models';

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

  async getTokenUser(payload: AuthPartnerCpfPayload): Promise<AuthPartnerCpfResponse> {
    const url = `${BASE_URL}/oauth/token`

    try {
      const response: AxiosResponse<AuthPartnerCpfResponse> = await firstValueFrom(this.httpService.post(url, payload))

      return response.data

    } catch (error: any) {
      const errorMessage = error.response.data.error === 'invalid_credentials'

      if (errorMessage) {
        throw new BadRequestException('CPF ou senha inválidos')
      }

      throw new BadRequestException(
        error.response?.data.message || 'Erro ao obter token'
      );
    }
  }

  async setProvider(payload: SetProviderPayload, token: string): Promise<any> {
    const url = `${BASE_URL}/api/users/set-provedor`

    try {
      const response: AxiosResponse<any> = await firstValueFrom(this.httpService.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }))

      return response.data
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.resposta || 'Erro ao setar provedor'
      );
    }
  }

  async getPremiumStatusByToken(token: string): Promise<any> {
    const url = `${BASE_URL}/api/users/get-premium-status`

    try {
      const response: AxiosResponse<any> = await firstValueFrom(this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }))

      return response.data
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.resposta || 'Erro ao obter status premium'
      );
    }
  }

  async getPremiumStatusByID(user_id: number): Promise<any> {
    const url = `${BASE_URL}/api/users/${user_id}/get-premium-status`

    try {
      const response: AxiosResponse<any> = await firstValueFrom(this.httpService.get(url))

      return response.data
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.resposta || 'Erro ao obter status premium'
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

  messageResponse(user_id: number, user_found: boolean): string {
    // usuario liberado no provedor e possui conta no banco de dados
    if (user_id && user_found) {
      return "Você já possui uma conta e está liberado no provedor. Agora é só fazer login.";
    }

    // usuario liberado no provedor e não possui conta no banco de dados
    if (user_id && !user_found) {
      return "Você está liberado no provedor, mas não possui uma conta. Prossiga com o registro.";
    }

    // usuario nao liberado no provedor e não possui conta no banco de dados
    if (!user_id && !user_found) {
      return "Você não está liberado no provedor. Será possível prosseguir, porém sem acesso premium. Prossiga com o registro.";
    }

    // usuario nao liberado no provedor e possui conta no banco de dados
    if (!user_id && user_found) {
      return "Você possui uma conta, mas não está liberado no provedor. Será possível prosseguir fazendo o login, porém sem acesso premium.";
    }

    return "Erro ao verificar cliente"
  }
}