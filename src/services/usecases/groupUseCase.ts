import type { GroupRepository } from '../repositories/contracts/groupRepository';

export class GroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getGroups() {
    return this.groupRepository.getGroups();
  }
}
