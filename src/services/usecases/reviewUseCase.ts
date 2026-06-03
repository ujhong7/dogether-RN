// MARK: - 리뷰 UseCase
//
// 역할: 대기 중인 인증 검사 목록 조회와 승인/거절 제출 흐름을 제공합니다.
// 읽는 법: Review 화면에서 submit했을 때 pending review queue가 어떻게 갱신되는지 추적합니다.
// iOS 비유: ReviewViewModel이 직접 네트워크를 호출하지 않고 ReviewUseCase를 통해 의도를 전달합니다.
// 주요 선언: `ReviewUseCase`.

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
