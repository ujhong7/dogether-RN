import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { Profile } from '../../models/profile';
import type { Ranking } from '../../models/ranking';
import type { UserRepository } from './contracts/userRepository';
import { toAppError } from '../errors/appError';

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
    } catch (error) {
      throw toAppError(error);
    }
  }

  async getMyProfile(): Promise<Profile> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ name: string; profileImageUrl?: string }>>(endpoints.profile);
      return {
        name: String(res.data.data?.name ?? 'RN Learner'),
        imageUrl: res.data.data?.profileImageUrl,
      };
    } catch (error) {
      throw toAppError(error);
    }
  }
}
