import { byId, child, v1 } from './path';

// MARK: - 챌린지 그룹/투두 API Endpoint
//
// 역할: 그룹 안의 투두 생성, 내 투두 조회, 멤버 투두 조회, 인증 관련 path를 정의합니다.
// 읽는 법: challengeGroups는 그룹 기준, todos/todoHistory는 투두 리소스 기준 endpoint입니다.

const challengeGroups = v1('/challenge-groups');
const todos = v1('/todos');
const todoHistory = v1('/todo-history');

export const challengeGroupEndpoints = {
  createTodos: (groupId: number) => byId(challengeGroups, groupId, '/todos'),
  myTodos: (groupId: number) => byId(challengeGroups, groupId, '/my-todos'),
  memberTodos: (groupId: number, memberId: number) =>
    child(byId(challengeGroups, groupId), `/challenge-group-members/${memberId}/today-todo-history`),
  certifyTodo: (todoId: number) => byId(todos, todoId, '/certify'),
  readTodo: (todoId: number) => byId(todoHistory, todoId),
};
