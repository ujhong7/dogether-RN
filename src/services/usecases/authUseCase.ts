import type { AuthRepository } from '../repositories/contracts/authRepository';
import type { AppleLoginPayload } from '../../models/auth';

export class AuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async loginDemo() {
    return this.authRepository.loginDemo();
  }

  async loginWithApple(payload: AppleLoginPayload) {
    return this.authRepository.loginWithApple(payload);
  }

  async refreshSession(refreshToken: string) {
    return this.authRepository.refreshSession(refreshToken);
  }
}
