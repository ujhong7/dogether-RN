import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserUseCase } from '../services/usecases/userUseCase';
import { createUserRepository } from '../services/repositories';

export function useRankingQuery(groupId?: number) {
  const userUseCase = useMemo(() => new UserUseCase(createUserRepository()), []);

  return useQuery({
    queryKey: ['ranking', groupId],
    enabled: Boolean(groupId),
    queryFn: () => userUseCase.getRanking(groupId as number),
  });
}
