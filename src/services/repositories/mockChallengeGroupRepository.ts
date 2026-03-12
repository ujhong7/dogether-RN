import type { Todo } from '../../models/todo';
import type { ChallengeGroupRepository } from './contracts/challengeGroupRepository';
import { getMockTodos, saveMockTodos, setMockTodos } from './mockTodoData';

const todosByGroupId: Record<number, Todo[]> = {
  101: [
    { id: 10101, content: '10분 아침 요가하기', status: 'WAIT_CERTIFICATION' },
    {
      id: 10102,
      content: '10분 아침 요가하기',
      status: 'WAIT_APPROVAL',
      certificationContent: '이 앱 보이시죠? 저 개발세끼함, ㄹㅇ',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 10103,
      content: '10분 아침 요가하기',
      status: 'REJECTED',
      certificationContent: '이 사진만으로는 확인이 어려워요.',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
      reviewFeedback: '이 사진만으로는 확인이 어려워요. 다음에는 노트북 화면이 보이게 찍어주시면 더욱 쉽게 인증할게요.',
    },
  ],
  102: [
    {
      id: 10201,
      content: '점심 과식하지 않기',
      status: 'APPROVED',
      certificationContent: '도시락 양 줄였어요',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
      reviewFeedback: '좋아요',
    },
    {
      id: 10202,
      content: '저녁 산책 20분',
      status: 'WAIT_APPROVAL',
      certificationContent: '공원 두 바퀴 돌았습니다',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=900&q=80',
    },
  ],
};

export class MockChallengeGroupRepository implements ChallengeGroupRepository {
  async getMyTodos(groupId: number, date: string): Promise<Todo[]> {
    const storedTodos = getMockTodos(groupId, date);
    if (storedTodos.length > 0) {
      return storedTodos;
    }

    return todosByGroupId[groupId] ?? [];
  }

  async createTodos(groupId: number, date: string, contents: string[]): Promise<Todo[]> {
    const storedTodos = getMockTodos(groupId, date);
    const baseTodos = storedTodos.length > 0 ? storedTodos : todosByGroupId[groupId] ?? [];
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
    const baseTodos = storedTodos.length > 0 ? storedTodos : todosByGroupId[groupId] ?? [];
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
