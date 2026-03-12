import type { Profile } from '../entities/profile';
import type { Ranking } from '../entities/ranking';

export interface UserRepository {
  getRanking(groupId: number): Promise<Ranking[]>;
  getMyProfile(): Promise<Profile>;
}
