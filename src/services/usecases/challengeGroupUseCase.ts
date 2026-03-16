import type { ChallengeGroupRepository } from '../repositories/contracts/challengeGroupRepository';

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

  async certifyTodo(groupId: number, date: string, todoId: number, content: string, mediaUrl: string) {
    return this.challengeGroupRepository.certifyTodo(groupId, date, todoId, content, mediaUrl);
  }
}
