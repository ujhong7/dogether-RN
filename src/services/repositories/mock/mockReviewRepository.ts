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
