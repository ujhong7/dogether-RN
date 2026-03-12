import type { AuthRepository } from '../repositories/authRepository';

export class AuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async loginDemo() {
    return this.authRepository.loginDemo();
  }
}
