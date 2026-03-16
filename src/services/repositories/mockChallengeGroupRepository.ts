import type { Todo } from '../../models/todo';
import type { ChallengeGroupRepository, MemberTodosResult } from './contracts/challengeGroupRepository';
import { getMockDefaultTodosForDate, getMockTodos, saveMockTodos, setMockTodos } from './mockTodoData';

export class MockChallengeGroupRepository implements ChallengeGroupRepository {
  async getMyTodos(groupId: number, date: string): Promise<Todo[]> {
    const storedTodos = getMockTodos(groupId, date);
    if (storedTodos.length > 0) {
      return storedTodos;
    }

    return getMockDefaultTodosForDate(groupId, date);
  }

  async getMemberTodos(groupId: number, _memberId: number): Promise<MemberTodosResult> {
    const date = new Date().toISOString().slice(0, 10);
    const todos = getMockTodos(groupId, date);

    return {
      selectedIndex: 0,
      todos: todos.filter((todo) => todo.status !== 'WAIT_CERTIFICATION'),
    };
  }

  async readTodo(_todoId: number): Promise<void> {}

  async createTodos(groupId: number, date: string, contents: string[]): Promise<Todo[]> {
    const storedTodos = getMockTodos(groupId, date);
    const baseTodos = storedTodos.length > 0 ? storedTodos : getMockDefaultTodosForDate(groupId, date);
    const lockedTodos = baseTodos.filter((todo) => todo.status !== 'WAIT_CERTIFICATION');
    const editableTodos = saveMockTodos(groupId, date, contents);
    const mergedTodos = [...editableTodos, ...lockedTodos];
    setMockTodos(groupId, date, mergedTodos);
    return mergedTodos;
  }

  async certifyTodo(
    groupId: number,
    date: string,
    todoId: number,
    content: string,
    mediaUrl: string,
  ): Promise<Todo | null> {
    const storedTodos = getMockTodos(groupId, date);
    const baseTodos = storedTodos.length > 0 ? storedTodos : getMockDefaultTodosForDate(groupId, date);
    const updatedTodos = baseTodos.map((todo) =>
      todo.id === todoId
        ? {
            ...todo,
            status: 'WAIT_APPROVAL' as const,
            certificationContent: content,
            certificationMediaUrl: mediaUrl,
          }
        : todo,
    );

    setMockTodos(groupId, date, updatedTodos);
    return updatedTodos.find((todo) => todo.id === todoId) ?? null;
  }
}
