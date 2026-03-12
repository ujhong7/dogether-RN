import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserUseCase } from '../services/usecases/userUseCase';
import { createUserRepository } from '../services/repositories';

export function useProfileQuery() {
  const userUseCase = useMemo(() => new UserUseCase(createUserRepository()), []);

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => userUseCase.getMyProfile(),
  });
}
