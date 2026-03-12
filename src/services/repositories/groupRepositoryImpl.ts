import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { Group } from '../../models/group';
import type { GroupRepository } from './contracts/groupRepository';

function mapGroup(raw: any): Group {
  return {
    id: Number(raw.groupId ?? raw.id ?? 1),
    name: String(raw.groupName ?? raw.name ?? 'Dogether Sample Group'),
    currentMember: Number(raw.currentMemberCount ?? raw.currentMember ?? 3),
    maximumMember: Number(raw.maximumMemberCount ?? raw.maximumMember ?? 5),
    joinCode: String(raw.joinCode ?? 'ABC12345'),
    status: (raw.status ?? 'running') as Group['status'],
    duration: Number(raw.progressDay ?? raw.duration ?? 12),
    progress: Number(raw.progressRate ?? raw.progress ?? 0.47),
    startDate: String(raw.startAt ?? raw.startDate ?? '2026-03-01'),
    endDate: String(raw.endAt ?? raw.endDate ?? '2026-03-21'),
  };
}

export class GroupRepositoryImpl implements GroupRepository {
  async checkParticipating(): Promise<boolean> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ checkParticipating: boolean }>>(endpoints.checkParticipating);
      return Boolean(res.data.data?.checkParticipating);
    } catch {
      return true;
    }
  }

  async getGroups(): Promise<Group[]> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ joiningChallengeGroups: any[] }>>(endpoints.groupsMy);
      const groups = (res.data.data?.joiningChallengeGroups ?? []).map(mapGroup);
      if (groups.length === 0) {
        return [];
      }
      return groups;
    } catch {
      return [
        {
          id: 1,
          name: 'RN 전환 스터디',
          currentMember: 3,
          maximumMember: 5,
          joinCode: 'RN2026',
          status: 'running',
          duration: 8,
          progress: 0.6,
          startDate: '2026-03-01',
          endDate: '2026-03-14',
        },
      ];
    }
  }
}
