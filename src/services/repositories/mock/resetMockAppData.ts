import { resetMockJoinedGroups } from './data/mockGroupData';
import { resetMockPendingReviews } from './data/mockReviewData';
import { resetMockTodos } from './data/mockTodoData';

export function resetMockAppData() {
  resetMockJoinedGroups();
  resetMockPendingReviews();
  resetMockTodos();
}
