import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createReviewRepository } from '../services/repositories';
import { ReviewUseCase } from '../services/usecases/reviewUseCase';

// MARK: - 미처리 리뷰 Query
//
// 역할: 앱 시작/메인 진입 시 사용자가 처리해야 할 리뷰 목록을 조회합니다.
// 읽는 법: reviewUseCase.getPendingReviews가 repository를 거쳐 서버/mock 데이터를 가져옵니다.

export function usePendingReviewsQuery() {
  const reviewUseCase = useMemo(
    () => new ReviewUseCase(createReviewRepository()),
    [],
  );

  return useQuery({
    queryKey: ['pending-reviews'],
    queryFn: () => reviewUseCase.getPendingReviews(),
  });
}
