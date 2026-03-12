import type { AppInfoRepository } from './contracts/appInfoRepository';

export class MockAppInfoRepository implements AppInfoRepository {
  async checkForceUpdate(): Promise<boolean> {
    return false;
  }
}
