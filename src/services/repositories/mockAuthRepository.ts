import type { AppleLoginPayload, AuthSession, RefreshSessionPayload } from '../../models/auth';
import type { AuthRepository } from './contracts/authRepository';

function buildMockSession(overrides?: Partial<AuthSession>): AuthSession {
  return {
    accessToken: `mock-token-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
    userName: 'RN Learner',
    loginType: 'demo',
    appleUserIdentifier: null,
    hasCompletedStartFlow: false,
    ...overrides,
  };
}

export class MockAuthRepository implements AuthRepository {
  async loginDemo(): Promise<AuthSession> {
    return buildMockSession();
  }

  async loginWithApple(payload: AppleLoginPayload): Promise<AuthSession> {
    return buildMockSession({
      userName: payload.name ?? 'Apple User',
      loginType: 'apple',
      appleUserIdentifier: payload.appleUserIdentifier ?? null,
    });
  }

  async refreshSession(refreshToken: string): Promise<RefreshSessionPayload> {
    return {
      accessToken: `mock-token-${Date.now()}`,
      refreshToken,
    };
  }
}
