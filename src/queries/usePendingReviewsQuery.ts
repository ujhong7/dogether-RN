import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createReviewRepository } from '../services/repositories';
import { ReviewUseCase } from '../services/usecases/reviewUseCase';

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
