import type { Todo } from '../../domain/entities/todo';
import type { ChallengeGroupRepository } from '../../domain/repositories/challengeGroupRepository';
import { getMockTodos, saveMockTodos } from './mockTodoData';

const todosByGroupId: Record<number, Todo[]> = {
  101: [
    { id: 10101, content: '10분 아침 요가하기', status: 'WAIT_CERTIFICATION' },
    { id: 10102, content: '10분 아침 요가하기', status: 'WAIT_APPROVAL' },
    { id: 10103, content: '10분 아침 요가하기', status: 'REJECTED', reviewFeedback: '인증 기준을 다시 확인해주세요' },
  ],
  102: [
    { id: 10201, content: '점심 과식하지 않기', status: 'APPROVED', reviewFeedback: '좋아요' },
    { id: 10202, content: '저녁 산책 20분', status: 'WAIT_APPROVAL' },
  ],
};

export class MockChallengeGroupRepository implements ChallengeGroupRepository {
  async getMyTodos(groupId: number, date: string): Promise<Todo[]> {
    const storedTodos = getMockTodos(groupId, date);
    if (storedTodos.length > 0) {
      return storedTodos;
    }

    return todosByGroupId[groupId] ?? [];
  }

  async createTodos(groupId: number, date: string, contents: string[]): Promise<Todo[]> {
    return saveMockTodos(groupId, date, contents);
  }
}
