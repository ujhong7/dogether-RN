import type { Profile } from '../../../models/profile';
import type { Ranking } from '../../../models/ranking';
import type { CertificationListData, CertificationListSort } from '../../../models/certificationList';

export interface UserRepository {
  getRanking(groupId: number): Promise<Ranking[]>;
  getMyProfile(): Promise<Profile>;
  getCertificationList(sort: CertificationListSort): Promise<CertificationListData>;
}
