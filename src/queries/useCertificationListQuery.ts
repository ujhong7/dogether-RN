import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CertificationListSort } from '../models/certificationList';
import { createUserRepository } from '../services/repositories';
import { UserUseCase } from '../services/usecases/userUseCase';

// MARK: - 인증 목록 Query
//
// 역할: 마이페이지의 인증 목록 서버 상태를 조회하고 정렬값별로 캐시를 분리합니다.
// 읽는 법: UseCase 생성 -> queryKey(sort 포함) -> queryFn 순서로 보면 됩니다.

export function useCertificationListQuery(sort: CertificationListSort) {
  const userUseCase = useMemo(() => new UserUseCase(createUserRepository()), []);

  return useQuery({
    // sort가 바뀌면 다른 목록으로 취급해야 하므로 queryKey에 포함합니다.
    queryKey: ['certification-list', sort],
    queryFn: () => userUseCase.getCertificationList(sort),
  });
}
