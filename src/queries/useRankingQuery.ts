import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserUseCase } from '../services/usecases/userUseCase';
import { createUserRepository } from '../services/repositories';

// MARK: - 랭킹 Query
//
// 역할: 선택 그룹의 랭킹 데이터를 조회합니다.
// 읽는 법: groupId가 queryKey에 들어가므로 그룹별 랭킹 캐시가 분리됩니다.

export function useRankingQuery(groupId?: number) {
  const userUseCase = useMemo(() => new UserUseCase(createUserRepository()), []);

  return useQuery({
    queryKey: ['ranking', groupId],
    // 선택 그룹이 정해지기 전에는 랭킹을 요청하지 않습니다.
    enabled: Boolean(groupId),
    queryFn: () => userUseCase.getRanking(groupId as number),
  });
}
