// MARK: - 리뷰 Repository Contract
//
// 역할: 인증 검사 대기 목록과 리뷰 제출 데이터 동작을 정의합니다.
// 읽는 법: Review 화면이 서버 또는 Mock 데이터에 기대하는 최소 기능을 확인합니다.
// iOS 비유: ReviewRepository protocol입니다.
// 주요 선언: `ReviewRepository`.

import type { PendingReview, ReviewResult } from '../../../models/review';

export interface ReviewRepository {
  getPendingReviews(): Promise<PendingReview[]>;
  submitReview(reviewId: number, result: ReviewResult, feedback?: string): Promise<PendingReview[]>;
}
