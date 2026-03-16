import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { Group } from '../../models/group';
import { getAppError } from '../../models/error';
import type { CreateGroupInput, GroupRepository, JoinGroupResult } from './contracts/groupRepository';
import { toAppError } from '../errors/appError';

function formatGroupDate(value: unknown) {
  const raw = String(value ?? '').trim();
  if (/^\d{2}\.\d{2}\.\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-');
    return `${year.slice(2)}.${month}.${day}`;
  }

  return raw || '26.03.01';
}

function mapGroupStatus(value: unknown): Group['status'] {
  switch (String(value ?? '').toUpperCase()) {
    case 'READY':
      return 'ready';
    case 'D_DAY':
      return 'dDay';
    default:
      return 'running';
  }
}

function mapGroup(raw: any): Group {
  return {
    id: Number(raw.groupId ?? raw.id ?? 1),
    name: String(raw.groupName ?? raw.name ?? 'Dogether Sample Group'),
    currentMember: Number(raw.currentMemberCount ?? raw.currentMember ?? 3),
    maximumMember: Number(raw.maximumMemberCount ?? raw.maximumMember ?? 5),
    joinCode: String(raw.joinCode ?? 'ABC12345'),
    status: mapGroupStatus(raw.status),
    duration: Number(raw.progressDay ?? raw.duration ?? 12),
    progress: Number(raw.progressRate ?? raw.progress ?? 0.47),
    startDate: formatGroupDate(raw.startAt ?? raw.startDate),
    endDate: formatGroupDate(raw.endAt ?? raw.endDate),
  };
}

export class GroupRepositoryImpl implements GroupRepository {
  async checkParticipating(): Promise<boolean> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ checkParticipating: boolean }>>(endpoints.groups.checkParticipating);
      return Boolean(res.data.data?.checkParticipating);
    } catch (error) {
      throw toAppError(error);
    }
  }

  async getGroups(): Promise<Group[]> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ joiningChallengeGroups: any[] }>>(endpoints.groups.my);
      const groups = (res.data.data?.joiningChallengeGroups ?? []).map(mapGroup);
      if (groups.length === 0) {
        return [];
      }
      return groups;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async createGroup(input: CreateGroupInput): Promise<Group> {
    try {
      const response = await apiClient.post<ApiEnvelope<{ joinCode: string }>>(endpoints.groups.create, {
        groupName: input.name,
        maximumMemberCount: input.memberCount,
        startAt: input.startAt,
        duration: input.durationDays,
      });
      const createdJoinCode = response.data.data?.joinCode ?? '';
      const groups = await this.getGroups();
      const createdGroup =
        groups.find((group) => group.joinCode === createdJoinCode) ??
        groups.find((group) => group.name === input.name) ??
        groups[0];

      if (!createdGroup) {
        throw getAppError('COMMON');
      }

      return {
        ...createdGroup,
        joinCode: createdJoinCode || createdGroup.joinCode,
      };
    } catch (error) {
      throw toAppError(error);
    }
  }

  async joinGroupByCode(code: string): Promise<JoinGroupResult> {
    try {
      await apiClient.post<ApiEnvelope<{
        groupName: string;
        duration: number;
        maximumMemberCount: number;
        startAt: string;
        endAt: string;
      }>>(endpoints.groups.join, {
        joinCode: code,
      });

      const groups = await this.getGroups();
      const joinedGroup = groups.find((group) => group.joinCode.toUpperCase() === code.trim().toUpperCase());
      if (!joinedGroup) {
        throw getAppError('COMMON');
      }

      return { ok: true, group: joinedGroup };
    } catch (error) {
      const appError = toAppError(error);
      if (appError.code === 'CGF-0002' || appError.code === 'CGF-0003' || appError.code === 'CGF-0004' || appError.code === 'CGF-0005') {
        return { ok: false, code: appError.code };
      }

      throw appError;
    }
  }

  async saveLastSelectedGroup(groupId: number): Promise<void> {
    try {
      await apiClient.post<ApiEnvelope<null>>(endpoints.groups.lastSelected, {
        groupId: String(groupId),
      });
    } catch (error) {
      throw toAppError(error);
    }
  }

  async leaveGroup(groupId: number): Promise<Group[]> {
    try {
      await apiClient.delete<ApiEnvelope<null>>(endpoints.groups.leave(groupId));
      return this.getGroups();
    } catch (error) {
      throw toAppError(error);
    }
  }
}
