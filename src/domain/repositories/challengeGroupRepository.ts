import type { Todo } from '../entities/todo';

export interface ChallengeGroupRepository {
  getMyTodos(groupId: number, date: string): Promise<Todo[]>;
  createTodos(groupId: number, date: string, contents: string[]): Promise<Todo[]>;
  certifyTodo(
    groupId: number,
    date: string,
    todoId: number,
    content: string,
    mediaUrl: string,
  ): Promise<Todo | null>;
}
