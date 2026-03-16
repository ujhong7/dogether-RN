import type { AppInfoRepository } from '../repositories/contracts/appInfoRepository';
import type { GroupRepository } from '../repositories/contracts/groupRepository';
import type { ReviewRepository } from '../repositories/contracts/reviewRepository';
export type LaunchRoute = 'update' | 'onboarding' | 'start' | 'main' | 'review';

export class AppLaunchUseCase {
  constructor(
    private readonly appInfoRepository: AppInfoRepository,
    private readonly groupRepository: GroupRepository,
    private readonly reviewRepository: ReviewRepository,
  ) {}

  async launchDelay() {
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  async decideNextRoute(
    isLoggedIn: boolean,
    appVersion: string,
  ): Promise<LaunchRoute> {
    const forceUpdate = await this.appInfoRepository.checkForceUpdate(appVersion);
    if (forceUpdate) {
      return 'update';
    }

    if (!isLoggedIn) {
      return 'onboarding';
    }

    // Use the actual joined group list as the source of truth for launch routing.
    // The participating flag can be temporarily stale on the dev server.
    const joinedGroups = await this.groupRepository.getGroups();
    if (joinedGroups.length === 0) {
      return 'start';
    }

    const pendingReviews = await this.reviewRepository.getPendingReviews();
    return pendingReviews.length > 0 ? 'review' : 'main';
  }
}
