// MARK: - 유저/마이페이지 UseCase
//
// 역할: 랭킹, 프로필, 통계, 인증 목록처럼 사용자 중심 조회 기능을 제공합니다.
// 읽는 법: 화면이 필요로 하는 조회 단위와 UserRepository 메서드의 대응 관계를 봅니다.
// iOS 비유: MyPageUseCase/StatisticsUseCase를 하나의 UserUseCase로 묶어둔 형태입니다.
// 주요 선언: `UserUseCase`.

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
