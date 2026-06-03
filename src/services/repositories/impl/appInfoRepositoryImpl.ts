// MARK: - App Info Repository Impl
//
// 역할: 실제 API를 호출해서 강제 업데이트 필요 여부를 확인합니다.

import { apiClient } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiEnvelope } from '../../../types/api';
import type { AppInfoRepository } from '../contracts/appInfoRepository';
import { toAppError } from '../../errors/appError';
import { getAppError } from '../../../models/error';

export class AppInfoRepositoryImpl implements AppInfoRepository {
  async checkForceUpdate(appVersion: string): Promise<boolean> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ forceUpdateRequired: boolean }>>(endpoints.appInfo.checkUpdate, {
        params: { 'app-version': appVersion },
      });
      const forceUpdateRequired = res.data.data?.forceUpdateRequired;
      if (typeof forceUpdateRequired !== 'boolean') {
        throw getAppError('COMMON');
      }

      return forceUpdateRequired;
    } catch (error) {
      throw toAppError(error);
    }
  }
}
