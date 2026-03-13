import type { PendingReview, ReviewResult } from '../../../models/review';

export interface ReviewRepository {
  getPendingReviews(): Promise<PendingReview[]>;
  submitReview(reviewId: number, result: ReviewResult, feedback?: string): Promise<PendingReview[]>;
}
