import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { AppInfoRepository } from './contracts/appInfoRepository';
import { toAppError } from '../errors/appError';

export class AppInfoRepositoryImpl implements AppInfoRepository {
  async checkForceUpdate(appVersion: string): Promise<boolean> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ forceUpdateRequired: boolean }>>(endpoints.appInfo.checkUpdate, {
        params: { 'app-version': appVersion },
      });
      return Boolean(res.data.data?.forceUpdateRequired);
    } catch (error) {
      throw toAppError(error);
    }
  }
}
