import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChallengeGroupUseCase } from '../services/usecases/challengeGroupUseCase';
import { createChallengeGroupRepository } from '../services/repositories';

type Params = {
  groupId?: number;
  date: string;
};

// MARK: - 내 투두 Query
//
// 역할: 선택된 그룹과 날짜에 해당하는 내 투두 목록을 조회합니다.
// 읽는 법: groupId/date가 queryKey가 되고, groupId가 있을 때만 요청이 활성화됩니다.

export function useMyTodosQuery({ groupId, date }: Params) {
  const challengeGroupUseCase = useMemo(
    () => new ChallengeGroupUseCase(createChallengeGroupRepository()),
    [],
  );

  return useQuery({
    queryKey: ['todos', groupId, date],
    // 아직 그룹 선택이 끝나지 않은 첫 렌더에서는 잘못된 요청을 보내지 않습니다.
    enabled: Boolean(groupId && date),
    queryFn: () => challengeGroupUseCase.getMyTodos(groupId!, date),
  });
}
