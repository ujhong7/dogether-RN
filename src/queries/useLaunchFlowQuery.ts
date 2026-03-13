import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { env } from '../config/env';
import { AppLaunchUseCase } from '../services/usecases/appLaunchUseCase';
import { createAppInfoRepository } from '../services/repositories';
import { createGroupRepository } from '../services/repositories';
import { createReviewRepository } from '../services/repositories';
import { useSessionStore } from '../stores/sessionStore';

export function useLaunchFlowQuery() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const token = useSessionStore((state) => state.accessToken);
  const useCase = useMemo(() => {
    return new AppLaunchUseCase(
      createAppInfoRepository(),
      createGroupRepository(),
      createReviewRepository(),
    );
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
