// MARK: - Mock App Info Repository
//
// 역할: mock 모드에서 강제 업데이트가 필요 없는 상태를 반환합니다.

import type { AppInfoRepository } from '../contracts/appInfoRepository';

export class MockAppInfoRepository implements AppInfoRepository {
  async checkForceUpdate(): Promise<boolean> {
    return false;
  }
}
