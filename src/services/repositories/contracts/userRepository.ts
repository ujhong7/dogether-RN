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
