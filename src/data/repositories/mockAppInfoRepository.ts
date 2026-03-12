import type { AppInfoRepository } from '../../domain/repositories/appInfoRepository';

export class MockAppInfoRepository implements AppInfoRepository {
  async checkForceUpdate(): Promise<boolean> {
    return false;
  }
}
