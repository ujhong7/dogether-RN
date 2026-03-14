import { endpoints } from '../api/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { AppleLoginPayload, AuthSession, RefreshSessionPayload } from '../../models/auth';
import { getAppError } from '../../models/error';
import { apiClient } from '../api/client';
import type { AuthRepository } from './contracts/authRepository';

export class AuthRepositoryImpl implements AuthRepository {
  async loginDemo(): Promise<AuthSession> {
    throw getAppError('COMMON');
  }

  async loginWithApple(payload: AppleLoginPayload): Promise<AuthSession> {
    try {
      const response = await apiClient.post<
        ApiEnvelope<{
          accessToken: string;
          refreshToken?: string | null;
          userName?: string | null;
          appleUserIdentifier?: string | null;
        }>
      >(endpoints.auth.appleLogin, payload);

      return {
        accessToken: response.data.data?.accessToken ?? '',
        refreshToken: response.data.data?.refreshToken ?? null,
        userName: response.data.data?.userName ?? payload.userName ?? 'Apple User',
        loginType: 'apple',
        appleUserIdentifier:
          response.data.data?.appleUserIdentifier ?? payload.appleUserIdentifier,
        hasCompletedStartFlow: false,
      };
    } catch {
      throw getAppError('COMMON');
    }
  }

  async refreshSession(refreshToken: string): Promise<RefreshSessionPayload> {
    try {
      const response = await apiClient.post<
        ApiEnvelope<{ accessToken: string; refreshToken?: string | null }>
      >(endpoints.auth.refresh, { refreshToken });

      return {
        accessToken: response.data.data?.accessToken ?? '',
        refreshToken: response.data.data?.refreshToken ?? refreshToken,
      };
    } catch {
      throw getAppError('COMMON');
    }
  }
}
