// MARK: - Auth Models
//
// 역할: 로그인/세션 관련 화면과 repository가 공유하는 타입을 정의합니다.

export type LoginType = 'apple' | 'kakao' | 'demo';

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

export type KakaoLoginPayload = {
  providerId: string;
  name: string;
};

export type RefreshSessionPayload = {
  accessToken: string;
  refreshToken?: string | null;
};
