export interface Access {
  user_id: number;
  provider_id: number;
  premium: boolean;
  access_token: {
    token: string;
    refresh_token: string;
    expiries: string;
  };
}

export interface AccessAdmin {
  user: {
    id: number;
    name: string;
    role: string;
    avatar: string;
  };
  access_token: {
    token: string;
    refresh_token: string;
    expiries: string;
  };
}