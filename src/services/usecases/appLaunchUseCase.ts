import type { AppInfoRepository } from '../repositories/contracts/appInfoRepository';
import type { GroupRepository } from '../repositories/contracts/groupRepository';
import type { ReviewRepository } from '../repositories/contracts/reviewRepository';
export type LaunchRoute = 'update' | 'onboarding' | 'start' | 'main' | 'review';

// MARK: - App Launch UseCase
//
// UseCase는 "화면이 무엇을 해야 하는가"보다 한 단계 안쪽의 비즈니스 규칙을 모아둔 계층입니다.
// SplashScreen은 이 클래스에게 다음 이동할 화면만 물어보고, 판단 기준은 여기서 관리합니다.
export class AppLaunchUseCase {
  constructor(
    private readonly appInfoRepository: AppInfoRepository,
    private readonly groupRepository: GroupRepository,
    private readonly reviewRepository: ReviewRepository,
  ) {}

  async launchDelay() {
    // 스플래시가 너무 빠르게 사라지지 않도록 최소 노출 시간을 만듭니다.
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  async decideNextRoute(
    isLoggedIn: boolean,
    appVersion: string,
  ): Promise<LaunchRoute> {
    // 1. 앱 버전이 낮아서 강제 업데이트가 필요하면 어떤 로그인 상태보다 업데이트가 우선입니다.
    const forceUpdate = await this.appInfoRepository.checkForceUpdate(appVersion);
    if (forceUpdate) {
      return 'update';
    }

    // 2. 토큰이 없으면 온보딩/로그인 플로우로 보냅니다.
    if (!isLoggedIn) {
      return 'onboarding';
    }

    // Use the actual joined group list as the source of truth for launch routing.
    // The participating flag can be temporarily stale on the dev server.
    const joinedGroups = await this.groupRepository.getGroups();
    if (joinedGroups.length === 0) {
      return 'start';
    }

    // 4. 가입한 그룹이 있고, 아직 리뷰할 인증이 있으면 리뷰 화면을 먼저 보여줍니다.
    const pendingReviews = await this.reviewRepository.getPendingReviews();
    return pendingReviews.length > 0 ? 'review' : 'main';
  }
}
