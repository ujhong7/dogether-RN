// MARK: - 투두/챌린지 Repository Contract
//
// 역할: 챌린지 그룹 안의 투두 조회/작성/인증 데이터 동작을 정의합니다.
// 읽는 법: 화면에서 필요한 Todo 관련 서버 기능의 목록을 먼저 파악할 때 봅니다.
// iOS 비유: TodoRepository protocol에 해당합니다. API/Mock 구현은 이 약속을 따라야 합니다.
// 주요 선언: `MemberTodosResult`, `ChallengeGroupRepository`.

import type { Todo } from '../../../models/todo';

export type MemberTodosResult = {
  selectedIndex: number;
  todos: Todo[];
};

export type CertificationMedia = {
  uri: string;
  mimeType?: string | null;
};

// Promise<T>는 Swift async 함수의 반환값 T와 비슷하게 보면 됩니다.
// 예: Promise<Todo[]>는 "비동기로 Todo 배열을 돌려준다"는 뜻입니다.
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
    media: CertificationMedia,
  ): Promise<Todo | null>;
}
