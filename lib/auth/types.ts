export type AuthUser = {
  id: string | number;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthSession = {
  user: AuthUser | null;
  authenticated: boolean;
};
