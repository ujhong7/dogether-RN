import type { Profile } from '../../models/profile';
import type { Ranking } from '../../models/ranking';
import type { UserRepository } from './contracts/userRepository';

const mockRanking: Ranking[] = [
  { memberId: 1, rank: 1, name: '승용차', achievementRate: 100 },
  { memberId: 2, rank: 2, name: '승용차', achievementRate: 80 },
  { memberId: 3, rank: 3, name: '승용차', achievementRate: 50 },
  { memberId: 4, rank: 4, name: '영재', achievementRate: 50 },
  { memberId: 5, rank: 5, name: '지호', achievementRate: 45 },
  { memberId: 6, rank: 5, name: '지호', achievementRate: 45 },
];

const mockProfile: Profile = {
  name: 'RN Learner',
};

export class MockUserRepository implements UserRepository {
  async getRanking(): Promise<Ranking[]> {
    return mockRanking;
  }

  async getMyProfile(): Promise<Profile> {
    return mockProfile;
  }
}
