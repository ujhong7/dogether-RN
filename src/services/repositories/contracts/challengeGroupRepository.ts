import type { Todo } from '../../../models/todo';

export type MemberTodosResult = {
  selectedIndex: number;
  todos: Todo[];
};

export interface ChallengeGroupRepository {
  getMyTodos(groupId: number, date: string): Promise<Todo[]>;
  getMemberTodos(groupId: number, memberId: number): Promise<MemberTodosResult>;
  readTodo(todoId: number): Promise<void>;
  createTodos(groupId: number, date: string, contents: string[]): Promise<Todo[]>;
  certifyTodo(
    groupId: number,
    date: string,
    todoId: number,
    content: string,
    mediaUrl: string,
  ): Promise<Todo | null>;
}
