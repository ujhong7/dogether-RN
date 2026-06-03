// MARK: - Mock Data Reset
//
// 역할: 회원탈퇴/초기화 시 mock 그룹, 리뷰, 투두 데이터를 기본 상태로 되돌립니다.

import { resetMockJoinedGroups } from './data/mockGroupData';
import { resetMockPendingReviews } from './data/mockReviewData';
import { resetMockTodos } from './data/mockTodoData';

export function resetMockAppData() {
  resetMockJoinedGroups();
  resetMockPendingReviews();
  resetMockTodos();
}
