// MARK: - Review Repository Impl
//
// 역할: 실제 API를 호출해서 대기 리뷰 조회와 리뷰 제출을 수행합니다.
// 읽는 법: API 응답 DTO를 앱 모델(PendingReview)로 변환하는 지점을 확인합니다.

import type { ReviewRepository } from '../contracts/reviewRepository';
import type { PendingReview, ReviewResult } from '../../../models/review';
import { apiClient } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiEnvelope } from '../../../types/api';
import { toAppError } from '../../errors/appError';
import { getAppError } from '../../../models/error';

type PendingReviewsResponse = {
  dailyTodoCertifications: Array<{
    id: number;
    groupId?: number;
    challengeGroupId?: number;
    content: string;
    mediaUrl: string;
    todoContent: string;
    doer: string;
  }>;
};

function requireNumber(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw getAppError('COMMON');
  }

  return parsed;
}

export class ReviewRepositoryImpl implements ReviewRepository {
  async getPendingReviews(): Promise<PendingReview[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<PendingReviewsResponse>>(endpoints.todoCertifications.pendingReview);
      return (response.data.data?.dailyTodoCertifications ?? []).map((item) => ({
        id: requireNumber(item.id),
        groupId: item.groupId ?? item.challengeGroupId,
        content: item.content,
        mediaUrl: item.mediaUrl,
        todoContent: item.todoContent,
        doer: item.doer,
      }));
    } catch (error) {
      throw toAppError(error);
    }
  }

  async submitReview(
    reviewId: number,
    result: ReviewResult,
    feedback?: string,
  ): Promise<PendingReview[]> {
    try {
      await apiClient.post<ApiEnvelope<null>>(endpoints.todoCertifications.review(reviewId), {
        result,
        reviewFeedback: feedback?.trim() ?? '',
      });
      return this.getPendingReviews();
    } catch (error) {
      throw toAppError(error);
    }
  }
}
