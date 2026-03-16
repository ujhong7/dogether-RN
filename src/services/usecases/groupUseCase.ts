import type { GroupRepository } from '../repositories/contracts/groupRepository';
import type { CreateGroupInput } from '../repositories/contracts/groupRepository';

export class GroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getGroups() {
    return this.groupRepository.getGroups();
  }

  async createGroup(input: CreateGroupInput) {
    return this.groupRepository.createGroup(input);
  }

  async joinGroupByCode(code: string) {
    return this.groupRepository.joinGroupByCode(code);
  }

  async saveLastSelectedGroup(groupId: number) {
    return this.groupRepository.saveLastSelectedGroup(groupId);
  }

  async leaveGroup(groupId: number) {
    return this.groupRepository.leaveGroup(groupId);
  }
}
