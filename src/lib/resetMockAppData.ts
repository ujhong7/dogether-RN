import { resetMockJoinedGroups } from '../services/repositories/mockGroupData';
import { resetMockTodos } from '../services/repositories/mockTodoData';

export function resetMockAppData() {
  resetMockJoinedGroups();
  resetMockTodos();
}
