import { apiClient } from '../network/client';
import { endpoints } from '../network/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { Todo } from '../../domain/entities/todo';
import type { ChallengeGroupRepository } from '../../domain/repositories/challengeGroupRepository';

function mapTodo(raw: any): Todo {
  return {
    id: Number(raw.id ?? 0),
    content: String(raw.content ?? ''),
    status: (raw.status ?? 'WAIT_CERTIFICATION') as Todo['status'],
    certificationContent: raw.certificationContent,
    certificationMediaUrl: raw.certificationMediaUrl,
    reviewFeedback: raw.reviewFeedback,
  };
}

export class ChallengeGroupRepositoryImpl implements ChallengeGroupRepository {
  async getMyTodos(groupId: number, date: string): Promise<Todo[]> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ todos: any[] }>>(endpoints.myTodos(groupId), {
        params: { date },
      });
      return (res.data.data?.todos ?? []).map(mapTodo);
    } catch {
      return [
        { id: 101, content: 'RN 라우팅 구조 잡기', status: 'APPROVED', reviewFeedback: '좋아요' },
        { id: 102, content: 'React Query로 서버 상태 분리', status: 'WAIT_APPROVAL' },
        { id: 103, content: 'Zustand로 UI 상태 관리', status: 'WAIT_CERTIFICATION' },
      ];
    }
  }

  async createTodos(_groupId: number, _date: string, contents: string[]): Promise<Todo[]> {
    return contents.map((content, index) => ({
      id: Date.now() + index,
      content,
      status: 'WAIT_CERTIFICATION',
    }));
  }
}
