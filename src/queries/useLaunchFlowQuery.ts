import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { env } from '../config/env';
import { AppLaunchUseCase } from '../services/usecases/appLaunchUseCase';
import { createAppInfoRepository } from '../services/repositories';
import { createGroupRepository } from '../services/repositories';
import { createReviewRepository } from '../services/repositories';
import { useSessionStore } from '../stores/sessionStore';

// MARK: - 앱 시작 플로우 Query
//
// 역할: 세션/앱 버전/리뷰 상태를 바탕으로 스플래시 이후 이동할 화면을 결정합니다.
// 읽는 법: hydrated/token 상태 -> UseCase 의존성 -> enabled/queryFn 순서로 보면 됩니다.

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
    // hydrated/token이 바뀌면 "앱 시작 판단"을 다시 계산해야 하므로 queryKey에 포함합니다.
    queryKey: ['launch-flow', hydrated, token],
    // MMKV에서 세션을 읽기 전에는 로그인 여부를 알 수 없으므로 query를 잠시 멈춥니다.
    enabled: hydrated,
    queryFn: async () => {
      await useCase.launchDelay();
      return useCase.decideNextRoute(Boolean(token), env.appVersion);
    },
  });
}
