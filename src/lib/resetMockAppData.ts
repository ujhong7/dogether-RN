import { resetMockJoinedGroups } from '../services/repositories/mockGroupData';
import { resetMockPendingReviews } from '../services/repositories/mockReviewData';
import { resetMockTodos } from '../services/repositories/mockTodoData';

export function resetMockAppData() {
  resetMockJoinedGroups();
  resetMockPendingReviews();
  resetMockTodos();
}
