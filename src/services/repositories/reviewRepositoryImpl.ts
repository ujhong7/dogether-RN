import type { ReviewRepository } from './contracts/reviewRepository';
import type { PendingReview, ReviewResult } from '../../models/review';

export class ReviewRepositoryImpl implements ReviewRepository {
  async getPendingReviews(): Promise<PendingReview[]> {
    return [];
  }

  async submitReview(
    _: number,
    __: ReviewResult,
    ___?: string,
  ): Promise<PendingReview[]> {
    return [];
  }
}
