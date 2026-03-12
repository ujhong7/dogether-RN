import type { Profile } from '../../../models/profile';
import type { Ranking } from '../../../models/ranking';

export interface UserRepository {
  getRanking(groupId: number): Promise<Ranking[]>;
  getMyProfile(): Promise<Profile>;
}
