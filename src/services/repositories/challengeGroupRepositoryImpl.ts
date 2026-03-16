import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { uploadImageToS3 } from '../api/s3Upload';
import type { ApiEnvelope } from '../../types/api';
import type { Todo } from '../../models/todo';
import type { ChallengeGroupRepository, MemberTodosResult } from './contracts/challengeGroupRepository';
import { toAppError } from '../errors/appError';

function mapTodoStatus(value: unknown): Todo['status'] {
  switch (String(value ?? '').toUpperCase()) {
    case 'CERTIFY_PENDING':
    case 'WAIT_CERTIFICATION':
      return 'WAIT_CERTIFICATION';
    case 'REVIEW_PENDING':
    case 'WAIT_APPROVAL':
      return 'WAIT_APPROVAL';
    case 'APPROVE':
    case 'APPROVED':
      return 'APPROVED';
    case 'REJECT':
    case 'REJECTED':
      return 'REJECTED';
    default:
      return 'WAIT_CERTIFICATION';
  }
}

function mapTodo(raw: any): Todo {
  return {
    id: Number(raw.id ?? 0),
    content: String(raw.content ?? ''),
    status: mapTodoStatus(raw.status),
    certificationContent: raw.certificationContent,
    certificationMediaUrl: raw.certificationMediaUrl,
    reviewFeedback: raw.reviewFeedback,
  };
}

type MemberTodosResponse = {
  currentTodoHistoryToReadIndex?: number;
  todos?: any[];
};

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

  async getMemberTodos(groupId: number, memberId: number): Promise<MemberTodosResult> {
    try {
      const res = await apiClient.get<ApiEnvelope<MemberTodosResponse>>(
        endpoints.challengeGroups.memberTodos(groupId, memberId),
      );

      return {
        selectedIndex: Number(res.data.data?.currentTodoHistoryToReadIndex ?? 0),
        todos: (res.data.data?.todos ?? []).map(mapTodo),
      };
    } catch (error) {
      throw toAppError(error);
    }
  }

  async readTodo(todoId: number): Promise<void> {
    try {
      await apiClient.post<ApiEnvelope<null>>(endpoints.challengeGroups.readTodo(todoId));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async createTodos(_groupId: number, _date: string, contents: string[]): Promise<Todo[]> {
    try {
      await apiClient.post<ApiEnvelope<null>>(endpoints.challengeGroups.createTodos(_groupId), {
        todos: [...contents].reverse(),
      });
      return this.getMyTodos(_groupId, _date);
    } catch (error) {
      throw toAppError(error);
    }
  }

  async certifyTodo(
    groupId: number,
    date: string,
    todoId: number,
    content: string,
    mediaUrl: string,
  ): Promise<Todo | null> {
    try {
      const uploadedMediaUrl = await uploadImageToS3(mediaUrl);
      await apiClient.post<ApiEnvelope<null>>(endpoints.challengeGroups.certifyTodo(todoId), {
        content,
        mediaUrl: uploadedMediaUrl,
      });

      const todos = await this.getMyTodos(groupId, date);
      return todos.find((todo) => todo.id === todoId) ?? null;
    } catch (error) {
      throw toAppError(error);
    }
  }
}
