// MARK: - Mock Auth Repository
//
// 역할: mock 모드에서 외부 SDK 없이 로그인 세션을 만들어 반환합니다.

import type {
  AppleLoginPayload,
  AuthSession,
  KakaoLoginPayload,
  RefreshSessionPayload,
} from '../../../models/auth';
import type { AuthRepository } from '../contracts/authRepository';

function buildMockSession(overrides?: Partial<AuthSession>): AuthSession {
  return {
    accessToken: 'mock-token-' + Date.now(),
    refreshToken: 'mock-refresh-' + Date.now(),
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
      userName: payload.name || 'Apple User',
      loginType: 'apple',
      appleUserIdentifier: payload.appleUserIdentifier ?? null,
    });
  }

  async loginWithKakao(payload: KakaoLoginPayload): Promise<AuthSession> {
    return buildMockSession({
      userName: payload.name || 'Kakao User',
      loginType: 'kakao',
    });
  }

  async refreshSession(refreshToken: string): Promise<RefreshSessionPayload> {
    return {
      accessToken: 'mock-token-' + Date.now(),
      refreshToken,
    };
  }

  async withdraw(): Promise<void> {}
}
