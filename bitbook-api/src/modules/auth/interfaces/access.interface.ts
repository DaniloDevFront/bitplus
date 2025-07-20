export interface Access {
  user_id: number;
  provider: {
    id: number;
    name: string;
    img_home: string;
  } | null;
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