// MARK: - 투두/챌린지 API Repository 구현
//
// 역할: ChallengeGroupRepository interface를 실제 API 호출로 구현합니다.
// 읽는 법: MARK 순서대로 "응답 mapping -> 응답 타입 -> API method"를 보면 됩니다.

import { apiClient } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import { uploadImageToS3 } from '../../api/s3Upload';
import type { ApiEnvelope } from '../../../types/api';
import type { Todo } from '../../../models/todo';
import type {
  CertificationMedia,
  ChallengeGroupRepository,
  MemberTodosResult,
} from '../contracts/challengeGroupRepository';
import { toAppError } from '../../errors/appError';
import { getAppError } from '../../../models/error';

// MARK: - Todo response mapping
//
// 서버의 status 문자열은 API 스펙 이름이고, 앱 내부 Todo 모델은 화면에서 쓰는 상태 이름입니다.
// repository에서 한 번 변환해두면 화면은 서버 naming을 몰라도 됩니다.
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
      throw getAppError('COMMON');
  }
}

function mapTodo(raw: any): Todo {
  const id = Number(raw.id);
  if (!Number.isFinite(id)) {
    throw getAppError('COMMON');
  }

  return {
    id,
    content: String(raw.content ?? ''),
    status: mapTodoStatus(raw.status),
    certificationContent: raw.certificationContent,
    certificationMediaUrl: raw.certificationMediaUrl,
    reviewFeedback: raw.reviewFeedback,
  };
}

// MARK: - API response types

type MemberTodosResponse = {
  currentTodoHistoryToReadIndex?: number;
  todos?: any[];
};

export class ChallengeGroupRepositoryImpl implements ChallengeGroupRepository {
  // MARK: - My todos
  //
  // 메인 화면에서 현재 그룹/날짜 기준으로 내가 작성한 투두 목록을 읽습니다.
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

  // MARK: - Member todos
  //
  // 랭킹 등에서 특정 멤버의 투두 히스토리를 볼 때 사용합니다.
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

  // MARK: - Read todo
  //
  // 다른 멤버의 투두 히스토리를 읽음 처리합니다.
  async readTodo(todoId: number): Promise<void> {
    try {
      await apiClient.post<ApiEnvelope<null>>(endpoints.challengeGroups.readTodo(todoId));
    } catch (error) {
      throw toAppError(error);
    }
  }

  // MARK: - Create todos
  //
  // 작성 화면에서 입력한 여러 투두를 서버에 저장한 뒤, 최신 목록을 다시 조회합니다.
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

  // MARK: - Certify todo
  //
  // 이미지 파일을 S3에 먼저 업로드하고, 업로드된 URL로 인증 API를 호출합니다.
  async certifyTodo(
    groupId: number,
    date: string,
    todoId: number,
    content: string,
    media: CertificationMedia,
  ): Promise<Todo | null> {
    try {
      const uploadedMediaUrl = await uploadImageToS3(media.uri, todoId, media.mimeType);
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
