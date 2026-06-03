import { byId, child, v1 } from './path';

// MARK: - 투두 인증 리뷰 API Endpoint
//
// 역할: 리뷰 대기 인증 목록 조회와 개별 인증 리뷰 제출 path를 정의합니다.

const todoCertifications = v1('/todo-certifications');

export const todoCertificationEndpoints = {
  pendingReview: child(todoCertifications, '/pending-review'),
  review: (todoId: number) => byId(todoCertifications, todoId, '/review'),
};
