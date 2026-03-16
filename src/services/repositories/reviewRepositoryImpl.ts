import type { ReviewRepository } from './contracts/reviewRepository';
import type { PendingReview, ReviewResult } from '../../models/review';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiEnvelope } from '../../types/api';
import { toAppError } from '../errors/appError';

type PendingReviewsResponse = {
  dailyTodoCertifications: Array<{
    id: number;
    content: string;
    mediaUrl: string;
    todoContent: string;
    doer: string;
  }>;
};

export class ReviewRepositoryImpl implements ReviewRepository {
  async getPendingReviews(): Promise<PendingReview[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<PendingReviewsResponse>>(endpoints.todoCertifications.pendingReview);
      return (response.data.data?.dailyTodoCertifications ?? []).map((item) => ({
        id: Number(item.id),
        groupId: 0,
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
