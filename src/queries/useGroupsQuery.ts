import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GroupUseCase } from '../services/usecases/groupUseCase';
import { createGroupRepository } from '../services/repositories';

// MARK: - 내 그룹 목록 Query
//
// 역할: 사용자가 참여 중인 그룹 목록을 조회합니다.
// 읽는 법: UseCase 생성 -> queryKey -> queryFn 순서로 보면 됩니다.

export function useGroupsQuery() {
  // useMemo를 쓰면 컴포넌트가 다시 렌더링되어도 UseCase 인스턴스를 계속 재사용합니다.
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  return useQuery({
    // queryKey는 React Query 캐시의 주소입니다. 같은 key면 같은 서버 상태로 취급됩니다.
    queryKey: ['groups'],
    // queryFn은 실제 데이터를 가져오는 함수입니다. 여기서는 UseCase를 통해 repository까지 내려갑니다.
    queryFn: () => groupUseCase.getGroups(),
  });
}
