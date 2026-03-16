import type { UserRepository } from '../repositories/contracts/userRepository';
import type { CertificationListSort } from '../../models/certificationList';

export class UserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async getRanking(groupId: number) {
    return this.userRepository.getRanking(groupId);
  }

  async getMyProfile() {
    return this.userRepository.getMyProfile();
  }

  async getStatistics(groupId: number) {
    return this.userRepository.getStatistics(groupId);
  }

  async getCertificationList(sort: CertificationListSort) {
    return this.userRepository.getCertificationList(sort);
  }
}
