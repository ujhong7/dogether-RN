// MARK: - 인증 UseCase
//
// 역할: 데모/Apple/Kakao 로그인과 세션 갱신 흐름을 AuthRepository 뒤에 감싼 계층입니다.
// 읽는 법: 온보딩 hook에서 호출한 로그인 동작이 어떤 repository 메서드로 이어지는지 봅니다.
// iOS 비유: LoginViewModel이 AuthUseCase를 호출하고, UseCase가 AuthRepository protocol을 호출하는 구조입니다.
// 주요 선언: `AuthUseCase`.

import type { AppleLoginPayload, KakaoLoginPayload } from '../../models/auth';
import type { AuthRepository } from '../repositories/contracts/authRepository';

export class AuthUseCase {
  // `private readonly`는 생성자로 받은 값을 이 클래스 안에서만 읽을 수 있게 보관한다는 뜻입니다.
  // Swift의 `private let authRepository: AuthRepository`와 비슷합니다.
  constructor(private readonly authRepository: AuthRepository) {}

  async loginDemo() {
    return this.authRepository.loginDemo();
  }

  async loginWithApple(payload: AppleLoginPayload) {
    return this.authRepository.loginWithApple(payload);
  }

  async loginWithKakao(payload: KakaoLoginPayload) {
    return this.authRepository.loginWithKakao(payload);
  }

  async refreshSession(refreshToken: string) {
    return this.authRepository.refreshSession(refreshToken);
  }

  async withdraw() {
    return this.authRepository.withdraw();
  }
}
