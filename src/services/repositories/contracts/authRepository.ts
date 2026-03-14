import type {
  AppleLoginPayload,
  AuthSession,
  KakaoLoginPayload,
  RefreshSessionPayload,
} from '../../../models/auth';

export interface AuthRepository {
  loginDemo(): Promise<AuthSession>;
  loginWithApple(payload: AppleLoginPayload): Promise<AuthSession>;
  loginWithKakao(payload: KakaoLoginPayload): Promise<AuthSession>;
  refreshSession(refreshToken: string): Promise<RefreshSessionPayload>;
}
