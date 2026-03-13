import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CertificationListSort } from '../models/certificationList';
import { createUserRepository } from '../services/repositories';
import { UserUseCase } from '../services/usecases/userUseCase';

export function useCertificationListQuery(sort: CertificationListSort) {
  const userUseCase = useMemo(() => new UserUseCase(createUserRepository()), []);

  return useQuery({
    queryKey: ['certification-list', sort],
    queryFn: () => userUseCase.getCertificationList(sort),
  });
}
