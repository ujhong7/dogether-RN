// MARK: - Mock Review Repository
//
// 역할: mock 모드에서 대기 리뷰 조회와 리뷰 제출을 로컬 데이터로 처리합니다.

import type { PendingReview, ReviewResult } from '../../../models/review';
import type { ReviewRepository } from '../contracts/reviewRepository';
import { readPendingReviews, submitMockReview } from './data/mockReviewData';

export class MockReviewRepository implements ReviewRepository {
  async getPendingReviews(): Promise<PendingReview[]> {
    return readPendingReviews();
  }

  async submitReview(
    reviewId: number,
    result: ReviewResult,
    feedback?: string,
  ): Promise<PendingReview[]> {
    return submitMockReview(reviewId, result, feedback);
  }
}
