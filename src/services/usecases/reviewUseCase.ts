import type { ReviewResult } from '../../models/review';
import type { ReviewRepository } from '../repositories/contracts/reviewRepository';

export class ReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async getPendingReviews() {
    return this.reviewRepository.getPendingReviews();
  }

  async submitReview(reviewId: number, result: ReviewResult, feedback?: string) {
    return this.reviewRepository.submitReview(reviewId, result, feedback);
  }
}
