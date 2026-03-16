import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createUserRepository } from '../services/repositories';
import { UserUseCase } from '../services/usecases/userUseCase';

export function useStatisticsQuery(groupId?: number) {
  const userUseCase = useMemo(() => new UserUseCase(createUserRepository()), []);

  return useQuery({
    queryKey: ['statistics', groupId],
    enabled: Boolean(groupId),
    queryFn: () => userUseCase.getStatistics(groupId!),
  });
}
