import type { AppleLoginPayload, KakaoLoginPayload } from '../../models/auth';
import type { AuthRepository } from '../repositories/contracts/authRepository';

export class AuthUseCase {
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
}
