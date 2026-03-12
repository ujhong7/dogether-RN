import { useMutation } from '@tanstack/react-query';
import { AuthUseCase } from '../services/usecases/authUseCase';
import { createAuthRepository } from '../services/repositories';
import { useSessionStore } from '../stores/sessionStore';

export function useOnboarding() {
  const loginStore = useSessionStore((state) => state.login);

  return useMutation({
    mutationFn: async () => {
      const useCase = new AuthUseCase(createAuthRepository());
      return useCase.loginDemo();
    },
    onSuccess: (data) => {
      loginStore({
        accessToken: data.accessToken,
        userName: data.userName,
        loginType: 'demo',
      });
    },
  });
}
