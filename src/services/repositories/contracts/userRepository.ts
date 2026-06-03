// MARK: - 유저 Repository Contract
//
// 역할: 프로필, 랭킹, 통계, 인증 목록 조회에 필요한 데이터 동작을 정의합니다.
// 읽는 법: 마이페이지/랭킹/통계 화면에서 어떤 데이터 shape을 기대하는지 먼저 확인합니다.
// iOS 비유: UserRepository protocol입니다.
// 주요 선언: `UserRepository`.

import type { Profile } from '../../../models/profile';
import type { Ranking } from '../../../models/ranking';
import type { CertificationListData, CertificationListSort } from '../../../models/certificationList';
import type { StatisticsData } from '../../../models/statistics';

export interface UserRepository {
  getRanking(groupId: number): Promise<Ranking[]>;
  getMyProfile(): Promise<Profile>;
  getStatistics(groupId: number): Promise<StatisticsData>;
  getCertificationList(sort: CertificationListSort): Promise<CertificationListData>;
}
