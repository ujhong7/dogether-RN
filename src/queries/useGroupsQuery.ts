import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GroupUseCase } from '../services/usecases/groupUseCase';
import { createGroupRepository } from '../services/repositories';

export function useGroupsQuery() {
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupUseCase.getGroups(),
  });
}
