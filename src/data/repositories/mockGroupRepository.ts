import type { Group } from '../../domain/entities/group';
import type { GroupRepository } from '../../domain/repositories/groupRepository';
import { getMockJoinedGroups, hasMockJoinedGroups } from './mockGroupData';

export class MockGroupRepository implements GroupRepository {
  async checkParticipating(): Promise<boolean> {
    return hasMockJoinedGroups();
  }

  async getGroups(): Promise<Group[]> {
    return getMockJoinedGroups();
  }
}
