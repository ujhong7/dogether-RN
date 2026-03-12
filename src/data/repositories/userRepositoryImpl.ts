import { apiClient } from '../network/client';
import { endpoints } from '../network/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { Profile } from '../../domain/entities/profile';
import type { Ranking } from '../../domain/entities/ranking';
import type { UserRepository } from '../../domain/repositories/userRepository';

export class UserRepositoryImpl implements UserRepository {
  async getRanking(groupId: number): Promise<Ranking[]> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ ranking: any[] }>>(endpoints.ranking(groupId));
      return (res.data.data?.ranking ?? []).map((raw, index) => ({
        memberId: Number(raw.memberId ?? index + 1),
        rank: Number(raw.rank ?? index + 1),
        name: String(raw.name ?? `Member ${index + 1}`),
        achievementRate: Number(raw.achievementRate ?? 0),
        profileImageUrl: raw.profileImageUrl,
      }));
    } catch {
      return [
        { memberId: 1, rank: 1, name: '유재홍', achievementRate: 97 },
        { memberId: 2, rank: 2, name: 'RN Crew A', achievementRate: 90 },
        { memberId: 3, rank: 3, name: 'RN Crew B', achievementRate: 82 },
      ];
    }
  }

  async getMyProfile(): Promise<Profile> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ name: string; profileImageUrl?: string }>>(endpoints.profile);
      return {
        name: String(res.data.data?.name ?? 'RN Learner'),
        imageUrl: res.data.data?.profileImageUrl,
      };
    } catch {
      return { name: 'RN Learner' };
    }
  }
}
