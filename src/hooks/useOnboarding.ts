import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { AuthUseCase } from '../services/usecases/authUseCase';
import { createAuthRepository } from '../services/repositories';
import { useSessionStore } from '../stores/sessionStore';

export function useOnboarding() {
  const loginStore = useSessionStore((state) => state.login);
  const authUseCase = useMemo(() => new AuthUseCase(createAuthRepository()), []);

  return useMutation({
    mutationFn: () => authUseCase.loginDemo(),
    onSuccess: (data) => {
      loginStore(data);
    },
  });
}
