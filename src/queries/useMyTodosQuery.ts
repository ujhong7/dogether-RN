import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChallengeGroupUseCase } from '../services/usecases/challengeGroupUseCase';
import { createChallengeGroupRepository } from '../services/repositories';

type Params = {
  groupId?: number;
  date: string;
};

export function useMyTodosQuery({ groupId, date }: Params) {
  const challengeGroupUseCase = useMemo(
    () => new ChallengeGroupUseCase(createChallengeGroupRepository()),
    [],
  );

  return useQuery({
    queryKey: ['todos', groupId, date],
    enabled: Boolean(groupId && date),
    queryFn: () => challengeGroupUseCase.getMyTodos(groupId!, date),
  });
}
