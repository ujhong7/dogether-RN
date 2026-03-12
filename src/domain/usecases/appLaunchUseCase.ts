import type { AppInfoRepository } from '../repositories/appInfoRepository';
import type { GroupRepository } from '../repositories/groupRepository';
export type LaunchRoute = 'update' | 'onboarding' | 'start' | 'main';

export class AppLaunchUseCase {
  constructor(
    private readonly appInfoRepository: AppInfoRepository,
    private readonly groupRepository: GroupRepository,
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
    return hasParticipatingGroup ? 'main' : 'start';
  }
}
