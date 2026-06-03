// MARK: - 투두/챌린지 Mock Repository 구현
//
// 역할: 서버 없이 내 투두 조회/작성/인증/멤버 투두 조회를 mock 데이터로 처리합니다.
// 읽는 법: "조회 -> 멤버 조회 -> 읽음 처리 -> 작성 -> 인증" 순서로 보면 됩니다.

import type { Todo } from '../../../models/todo';
import type {
  CertificationMedia,
  ChallengeGroupRepository,
  MemberTodosResult,
} from '../contracts/challengeGroupRepository';
import { getMockDefaultTodosForDate, getMockTodos, saveMockTodos, setMockTodos } from './data/mockTodoData';

export class MockChallengeGroupRepository implements ChallengeGroupRepository {
  // MARK: - My todos

  async getMyTodos(groupId: number, date: string): Promise<Todo[]> {
    const storedTodos = getMockTodos(groupId, date);
    if (storedTodos.length > 0) {
      return storedTodos;
    }

    return getMockDefaultTodosForDate(groupId, date);
  }

  // MARK: - Member todos

  async getMemberTodos(groupId: number, _memberId: number): Promise<MemberTodosResult> {
    const date = new Date().toISOString().slice(0, 10);
    const todos = getMockTodos(groupId, date);

    return {
      selectedIndex: 0,
      todos: todos.filter((todo) => todo.status !== 'WAIT_CERTIFICATION'),
    };
  }

  // MARK: - Read todo

  async readTodo(_todoId: number): Promise<void> {}

  // MARK: - Create todos

  async createTodos(groupId: number, date: string, contents: string[]): Promise<Todo[]> {
    const storedTodos = getMockTodos(groupId, date);
    const baseTodos = storedTodos.length > 0 ? storedTodos : getMockDefaultTodosForDate(groupId, date);
    const lockedTodos = baseTodos.filter((todo) => todo.status !== 'WAIT_CERTIFICATION');
    const editableTodos = saveMockTodos(groupId, date, contents);
    const mergedTodos = [...editableTodos, ...lockedTodos];
    setMockTodos(groupId, date, mergedTodos);
    return mergedTodos;
  }

  // MARK: - Certify todo

  async certifyTodo(
    groupId: number,
    date: string,
    todoId: number,
    content: string,
    media: CertificationMedia,
  ): Promise<Todo | null> {
    const storedTodos = getMockTodos(groupId, date);
    const baseTodos = storedTodos.length > 0 ? storedTodos : getMockDefaultTodosForDate(groupId, date);
    const updatedTodos = baseTodos.map((todo) =>
      todo.id === todoId
        ? {
            ...todo,
            status: 'WAIT_APPROVAL' as const,
            certificationContent: content,
            certificationMediaUrl: media.uri,
          }
        : todo,
    );

    setMockTodos(groupId, date, updatedTodos);
    return updatedTodos.find((todo) => todo.id === todoId) ?? null;
  }
}
