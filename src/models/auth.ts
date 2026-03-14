export type LoginType = 'apple' | 'demo';

export type AuthSession = {
  accessToken: string;
  refreshToken?: string | null;
  userName: string;
  loginType: LoginType;
  appleUserIdentifier?: string | null;
  hasCompletedStartFlow: boolean;
};

export type AppleLoginPayload = {
  providerId: string;
  name: string;
  authorizationCode?: string | null;
  appleUserIdentifier?: string | null;
};

export type RefreshSessionPayload = {
  accessToken: string;
  refreshToken?: string | null;
};
