import type { AuthRepository } from './contracts/authRepository';

export class AuthRepositoryImpl implements AuthRepository {
  async loginDemo(): Promise<{ userName: string; accessToken: string }> {
    return {
      userName: 'RN Learner',
      accessToken: `demo-token-${Date.now()}`,
    };
  }
}
