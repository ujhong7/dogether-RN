// MARK: - 그룹 API Repository 구현
//
// 역할: GroupRepository interface를 실제 서버 API 호출로 구현합니다.
// 읽는 법: endpoint 호출 -> API 응답 envelope -> 앱 모델(Group) mapping 순서로 따라가면 됩니다.
// iOS 비유: GroupRepository protocol의 URLSession/Alamofire 기반 production 구현체입니다.
// 주요 선언: `GroupRepositoryImpl`, `mapGroup`.

import { apiClient } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiEnvelope } from '../../../types/api';
import type { Group } from '../../../models/group';
import { getAppError } from '../../../models/error';
import type { CreateGroupInput, GroupRepository, JoinGroupResult } from '../contracts/groupRepository';
import { toAppError } from '../../errors/appError';

// MARK: - Date formatting helpers
//
// 서버가 내려주는 날짜 형식이 화면 표시 형식과 다를 수 있어 repository에서 통일합니다.
function formatGroupDate(value: unknown) {
  const raw = String(value ?? '').trim();
  if (/^\d{2}\.\d{2}\.\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-');
    return `${year.slice(2)}.${month}.${day}`;
  }

  throw getAppError('COMMON');
}

function requireString(value: unknown) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    throw getAppError('COMMON');
  }

  return normalized;
}

function requireNumber(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw getAppError('COMMON');
  }

  return parsed;
}

// MARK: - API response mapping
//
// 서버 응답 필드명은 groupId/groupName처럼 API 스펙을 따르고,
// 앱 내부 모델은 id/name/status처럼 화면에서 쓰기 쉬운 이름을 씁니다.
// 이 변환을 repository에 모아두면 screen/hook은 서버 필드명을 몰라도 됩니다.
function mapGroupStatus(value: unknown): Group['status'] {
  switch (String(value ?? '').toUpperCase()) {
    case 'READY':
      return 'ready';
    case 'D_DAY':
      return 'dDay';
    case 'RUNNING':
    case 'IN_PROGRESS':
      return 'running';
    default:
      throw getAppError('COMMON');
  }
}

function mapGroup(raw: any): Group {
  return {
    id: requireNumber(raw.groupId ?? raw.id),
    name: requireString(raw.groupName ?? raw.name),
    currentMember: requireNumber(raw.currentMemberCount ?? raw.currentMember),
    maximumMember: requireNumber(raw.maximumMemberCount ?? raw.maximumMember),
    joinCode: String(raw.joinCode ?? '').trim() || undefined,
    status: mapGroupStatus(raw.status),
    duration: requireNumber(raw.progressDay ?? raw.duration),
    progress: requireNumber(raw.progressRate ?? raw.progress),
    startDate: formatGroupDate(raw.startAt ?? raw.startDate),
    endDate: formatGroupDate(raw.endAt ?? raw.endDate),
  };
}

export class GroupRepositoryImpl implements GroupRepository {
  // MARK: - Participation check
  //
  // 앱 시작 분기에서 "가입한 그룹이 있는지" 빠르게 확인할 때 사용합니다.
  async checkParticipating(): Promise<boolean> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ checkParticipating: boolean }>>(endpoints.groups.checkParticipating);
      return Boolean(res.data.data?.checkParticipating);
    } catch (error) {
      throw toAppError(error);
    }
  }

  // MARK: - Joined groups
  //
  // 현재 사용자가 참여 중인 그룹 목록을 조회하고 앱 내부 Group 모델로 변환합니다.
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

  // MARK: - Create group
  //
  // 그룹 생성 API는 joinCode만 돌려주므로, 생성 후 그룹 목록을 다시 읽어 실제 Group 모델을 찾아 반환합니다.
  async createGroup(input: CreateGroupInput): Promise<Group> {
    try {
      const response = await apiClient.post<ApiEnvelope<{ joinCode: string }>>(endpoints.groups.create, {
        groupName: input.name,
        maximumMemberCount: input.memberCount,
        startAt: input.startAt,
        duration: input.durationDays,
      });
      const createdJoinCode = requireString(response.data.data?.joinCode);
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
        joinCode: createdJoinCode,
      };
    } catch (error) {
      throw toAppError(error);
    }
  }

  // MARK: - Join group
  //
  // 초대 코드로 그룹에 참여합니다. 특정 비즈니스 에러는 throw하지 않고 화면이 분기할 수 있게 결과값으로 반환합니다.
  async joinGroupByCode(code: string): Promise<JoinGroupResult> {
    try {
      const response = await apiClient.post<ApiEnvelope<{
        groupName: string;
        duration: number;
        maximumMemberCount: number;
        startAt: string;
        endAt: string;
      }>>(endpoints.groups.join, {
        joinCode: code,
      });

      const groups = await this.getGroups();
      const normalizedCode = code.trim().toUpperCase();
      const responseGroupName = response.data.data?.groupName?.trim();
      const joinedGroup =
        groups.find((group) => group.joinCode?.toUpperCase() === normalizedCode) ??
        groups.find((group) => responseGroupName && group.name === responseGroupName);
      if (!joinedGroup) {
        throw getAppError('COMMON');
      }

      return {
        ok: true,
        group: {
          ...joinedGroup,
          joinCode: joinedGroup.joinCode ?? normalizedCode,
        },
      };
    } catch (error) {
      const appError = toAppError(error);
      if (appError.code === 'CGF-0002' || appError.code === 'CGF-0003' || appError.code === 'CGF-0004' || appError.code === 'CGF-0005') {
        return { ok: false, code: appError.code };
      }

      throw appError;
    }
  }

  // MARK: - Last selected group
  //
  // 사용자가 마지막으로 선택한 그룹을 서버에 저장해 다음 진입 시 복원할 수 있게 합니다.
  async saveLastSelectedGroup(groupId: number): Promise<void> {
    try {
      await apiClient.post<ApiEnvelope<null>>(endpoints.groups.lastSelected, {
        groupId: String(groupId),
      });
    } catch (error) {
      throw toAppError(error);
    }
  }

  // MARK: - Leave group
  //
  // 그룹 탈퇴 후 남은 그룹 목록을 다시 조회해 화면 상태를 최신으로 맞춥니다.
  async leaveGroup(groupId: number): Promise<Group[]> {
    try {
      await apiClient.delete<ApiEnvelope<null>>(endpoints.groups.leave(groupId));
      return this.getGroups();
    } catch (error) {
      throw toAppError(error);
    }
  }
}
