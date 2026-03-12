import type { UserRepository } from '../repositories/contracts/userRepository';

export class UserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async getRanking(groupId: number) {
    return this.userRepository.getRanking(groupId);
  }

  async getMyProfile() {
    return this.userRepository.getMyProfile();
  }
}
