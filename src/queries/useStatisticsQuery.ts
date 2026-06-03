import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createUserRepository } from '../services/repositories';
import { UserUseCase } from '../services/usecases/userUseCase';

// MARK: - 통계 Query
//
// 역할: 선택 그룹 기준의 내 인증 통계 데이터를 조회합니다.
// 읽는 법: ranking query와 비슷하게 groupId별 캐시와 enabled 조건을 확인하면 됩니다.

export function useStatisticsQuery(groupId?: number) {
  const userUseCase = useMemo(() => new UserUseCase(createUserRepository()), []);

  return useQuery({
    queryKey: ['statistics', groupId],
    // groupId가 없을 때는 아직 화면에서 조회할 대상이 없는 상태입니다.
    enabled: Boolean(groupId),
    queryFn: () => userUseCase.getStatistics(groupId!),
  });
}
