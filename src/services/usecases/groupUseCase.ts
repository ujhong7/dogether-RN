// MARK: - 그룹 UseCase
//
// 역할: 그룹 생성/참여/선택 저장/탈퇴처럼 그룹 기능의 앱 흐름을 Repository 뒤에 감싼 계층입니다.
// 읽는 법: 화면 hook이 어떤 비즈니스 동작을 호출하고, 그 호출이 어떤 repository 메서드로 내려가는지 봅니다.
// iOS 비유: ViewModel이 직접 APIClient를 부르지 않고 GroupUseCase -> GroupRepository protocol을 타는 구조입니다.
// 주요 선언: `GroupUseCase`.

import type { GroupRepository } from '../repositories/contracts/groupRepository';
import type { CreateGroupInput } from '../repositories/contracts/groupRepository';

export class GroupUseCase {
  // 생성자 주입입니다. Swift에서 init(repository: GroupRepository)로 protocol 구현체를 받는 것과 비슷합니다.
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
