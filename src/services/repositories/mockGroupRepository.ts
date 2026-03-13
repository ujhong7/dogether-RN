import type { Group } from '../../models/group';
import type { GroupRepository } from './contracts/groupRepository';
import { getMockJoinedGroups, hasMockJoinedGroups, leaveMockGroup } from './mockGroupData';
import { removeMockTodosByGroup } from './mockTodoData';

export class MockGroupRepository implements GroupRepository {
  async checkParticipating(): Promise<boolean> {
    return hasMockJoinedGroups();
  }

  async getGroups(): Promise<Group[]> {
    return getMockJoinedGroups();
  }

  async leaveGroup(groupId: number): Promise<Group[]> {
    removeMockTodosByGroup(groupId);
    return leaveMockGroup(groupId);
  }
}
