// MARK: - Mock Group Repository
//
// 역할: mock 모드에서 그룹 생성/참여/탈퇴를 로컬 mock 데이터로 처리합니다.

import type { Group } from '../../../models/group';
import type { CreateGroupInput, GroupRepository, JoinGroupResult } from '../contracts/groupRepository';
import { createMockGroup, getMockJoinedGroups, hasMockJoinedGroups, joinMockGroupByCode, leaveMockGroup } from './data/mockGroupData';
import { removeMockTodosByGroup } from './data/mockTodoData';

export class MockGroupRepository implements GroupRepository {
  async checkParticipating(): Promise<boolean> {
    return hasMockJoinedGroups();
  }

  async getGroups(): Promise<Group[]> {
    return getMockJoinedGroups();
  }

  async createGroup(input: CreateGroupInput): Promise<Group> {
    return createMockGroup(input);
  }

  async joinGroupByCode(code: string): Promise<JoinGroupResult> {
    return joinMockGroupByCode(code);
  }

  async saveLastSelectedGroup(_groupId: number): Promise<void> {
    return;
  }

  async leaveGroup(groupId: number): Promise<Group[]> {
    removeMockTodosByGroup(groupId);
    return leaveMockGroup(groupId);
  }
}
