import type { AppleLoginPayload, AuthSession, RefreshSessionPayload } from '../../../models/auth';

export interface AuthRepository {
  loginDemo(): Promise<AuthSession>;
  loginWithApple(payload: AppleLoginPayload): Promise<AuthSession>;
  refreshSession(refreshToken: string): Promise<RefreshSessionPayload>;
}
