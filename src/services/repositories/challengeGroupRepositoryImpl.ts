import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { Todo } from '../../models/todo';
import type { ChallengeGroupRepository } from './contracts/challengeGroupRepository';
import { toAppError } from '../errors/appError';

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
      const res = await apiClient.get<ApiEnvelope<{ todos: any[] }>>(endpoints.challengeGroups.myTodos(groupId), {
        params: { date },
      });
      return (res.data.data?.todos ?? []).map(mapTodo);
    } catch (error) {
      throw toAppError(error);
    }
  }

  async createTodos(_groupId: number, _date: string, contents: string[]): Promise<Todo[]> {
    return contents.map((content, index) => ({
      id: Date.now() + index,
      content,
      status: 'WAIT_CERTIFICATION',
    }));
  }

  async certifyTodo(
    _groupId: number,
    _date: string,
    todoId: number,
    content: string,
    mediaUrl: string,
  ): Promise<Todo | null> {
    return {
      id: todoId,
      content,
      status: 'WAIT_APPROVAL',
      certificationContent: content,
      certificationMediaUrl: mediaUrl,
    };
  }
}
