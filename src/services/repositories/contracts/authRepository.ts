// MARK: - 인증 Repository Contract
//
// 역할: 로그인/세션 갱신에 필요한 데이터 동작을 interface로 정의합니다.
// 읽는 법: native SDK에서 받은 값이 어떤 payload로 서버/Mock repository에 전달되는지 확인합니다.
// iOS 비유: AuthRepository protocol입니다. 실제 API 구현과 테스트용 Mock 구현이 같은 메서드를 제공합니다.
// 주요 선언: `AuthRepository`.

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
  withdraw(): Promise<void>;
}
