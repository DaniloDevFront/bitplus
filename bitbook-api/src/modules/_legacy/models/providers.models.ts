export interface Provider {
  id: number;
  nome: string;
  img: string;
  img_lista: string;
  img_grande: string;
  campo_vinculacao: string;
  campo_vinculacao_label: string;
  tipos_vinculacao: string[];
  syntesis: string | null;
  neotv: string | null;
}
export interface ProviderResponse {
  empresas: Provider[];
}

/**
 * Check Client Provider
 */
export interface CheckClientPayload {
  chave: string;
  password?: string;
}

export interface CheckClientResponse {
  empresa: Provider;
  message: string;
  user: number;
  user_found: boolean;
  user_login_ways: string[];
}



export interface AuthPartnerCpfResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}