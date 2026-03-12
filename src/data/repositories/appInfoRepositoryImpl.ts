import { apiClient } from '../network/client';
import { endpoints } from '../network/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { AppInfoRepository } from '../../domain/repositories/appInfoRepository';

export class AppInfoRepositoryImpl implements AppInfoRepository {
  async checkForceUpdate(appVersion: string): Promise<boolean> {
    try {
      const res = await apiClient.get<ApiEnvelope<{ forceUpdateRequired: boolean }>>(endpoints.checkUpdate, {
        params: { 'app-version': appVersion },
      });
      return Boolean(res.data.data?.forceUpdateRequired);
    } catch {
      return false;
    }
  }
}
