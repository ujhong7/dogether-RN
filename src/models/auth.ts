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
  identityToken: string;
  authorizationCode: string;
  userName?: string | null;
  appleUserIdentifier: string;
};

export type RefreshSessionPayload = {
  accessToken: string;
  refreshToken?: string | null;
};
