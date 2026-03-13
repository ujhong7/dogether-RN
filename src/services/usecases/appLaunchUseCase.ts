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

    const hasParticipatingGroup = await this.groupRepository.checkParticipating();
    if (!hasParticipatingGroup) {
      return 'start';
    }

    const pendingReviews = await this.reviewRepository.getPendingReviews();
    return pendingReviews.length > 0 ? 'review' : 'main';
  }
}
