// MARK: - 투두/챌린지 UseCase
//
// 역할: 내 투두 조회, 멤버 투두 조회, 투두 작성, 인증 제출처럼 챌린지 내부 기능을 제공합니다.
// 읽는 법: 메인/투두작성/인증 화면 hook에서 호출하는 동작이 어떤 repository로 내려가는지 봅니다.
// iOS 비유: HomeUseCase 또는 TodoUseCase가 Repository protocol을 통해 서버/Mock 구현을 숨기는 구조입니다.
// 주요 선언: `ChallengeGroupUseCase`.

import type {
  CertificationMedia,
  ChallengeGroupRepository,
} from '../repositories/contracts/challengeGroupRepository';

export class ChallengeGroupUseCase {
  constructor(private readonly challengeGroupRepository: ChallengeGroupRepository) {}

  async getMyTodos(groupId: number, date: string) {
    return this.challengeGroupRepository.getMyTodos(groupId, date);
  }

  async getMemberTodos(groupId: number, memberId: number) {
    return this.challengeGroupRepository.getMemberTodos(groupId, memberId);
  }

  async readTodo(todoId: number) {
    return this.challengeGroupRepository.readTodo(todoId);
  }

  async createTodos(groupId: number, date: string, contents: string[]) {
    return this.challengeGroupRepository.createTodos(groupId, date, contents);
  }

  async certifyTodo(
    groupId: number,
    date: string,
    todoId: number,
    content: string,
    media: CertificationMedia,
  ) {
    return this.challengeGroupRepository.certifyTodo(groupId, date, todoId, content, media);
  }
}
