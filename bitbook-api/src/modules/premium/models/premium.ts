export interface Empresa {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  descricao: string | null;
  cnpj: string | null;
  user_id: number;
  qtd_inscricoes: number;
  status: number;
  peso: number;
  visivel_home_app: number;
  campo_vinculacao: string;
  visivel_app: number;
  categoria_id: number;
  slug: string | null;
  token_externo: string | null;
  recebe_integracao: number;
  integra_syntesis: number;
  integra_sgp: number;
  integra_mksolutions: number;
  integra_gerenet: number;
  integra_ixc: number;
  integra_topsapp: number;
  integra_hubsoft: number;
  integra_leaf: number;
  integra_rbx: number;
  integra_interfocus: number;
  integra_erp_proprio: number;
  integra_neotv: number;
  integra_wgc: number;
  integra_logica: number;
  integra_7az: number;
  integra_mkfull: number;
  integra_brbyte: number;
  total_clientes: number;
  tua: string | null;
  total_clientes_planos: number | null;
  tamanho_logo_home: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  img: string;
  img_grande: string;
  img_lista: string;
  img_home: string | null;
}

export interface Vinculo {
  id: number;
  user_id: number;
  empresa_id: number;
  cpf: string;
  codigo_utilizado: string;
  desvinculated_at: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  data_vinculacao: string;
}

export interface PremiumByUser {
  premium: boolean;
  transacao: any | null;
  empresa: Empresa | null;
  message: string | null;
  vinculos: Vinculo[];
  vinculo_atual: Vinculo | null;
  hasCpf: boolean;
}