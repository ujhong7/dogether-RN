import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserUseCase } from '../services/usecases/userUseCase';
import { createUserRepository } from '../services/repositories';

// MARK: - 내 프로필 Query
//
// 역할: 마이페이지에서 보여줄 사용자 프로필 서버 상태를 조회합니다.
// 읽는 법: queryKey가 ['profile']이므로 앱 안에서 하나의 프로필 캐시를 공유합니다.

export function useProfileQuery() {
  const userUseCase = useMemo(() => new UserUseCase(createUserRepository()), []);

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => userUseCase.getMyProfile(),
  });
}
