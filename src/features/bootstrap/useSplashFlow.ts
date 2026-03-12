import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { env } from '../../config/env';
import { AppLaunchUseCase } from '../../domain/usecases/appLaunchUseCase';
import { createAppInfoRepository } from '../../data/repositories';
import { createGroupRepository } from '../../data/repositories';
import { useSessionStore } from '../../store/sessionStore';

export function useSplashFlow() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const token = useSessionStore((state) => state.accessToken);
  const useCase = useMemo(() => {
    return new AppLaunchUseCase(createAppInfoRepository(), createGroupRepository());
  }, []);

  return useQuery({
    queryKey: ['launch-flow', hydrated, token],
    enabled: hydrated,
    queryFn: async () => {
      await useCase.launchDelay();
      return useCase.decideNextRoute(Boolean(token), env.appVersion);
    },
  });
}
