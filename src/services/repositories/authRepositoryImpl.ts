import { endpoints } from '../api/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type { AppleLoginPayload, AuthSession, RefreshSessionPayload } from '../../models/auth';
import { getAppError } from '../../models/error';
import { apiClient } from '../api/client';
import type { AuthRepository } from './contracts/authRepository';
import { toAppError } from '../errors/appError';

export class AuthRepositoryImpl implements AuthRepository {
  async loginDemo(): Promise<AuthSession> {
    throw getAppError('COMMON');
  }

  async loginWithApple(payload: AppleLoginPayload): Promise<AuthSession> {
    try {
      const response = await apiClient.post<
        ApiEnvelope<{
          accessToken: string;
          name: string;
        }>
      >(endpoints.auth.login, {
        loginType: 'APPLE',
        providerId: payload.providerId,
        name: payload.name,
      });

      return {
        accessToken: response.data.data?.accessToken ?? '',
        refreshToken: null,
        userName: response.data.data?.name ?? payload.name ?? 'Apple User',
        loginType: 'apple',
        appleUserIdentifier: payload.appleUserIdentifier ?? null,
        hasCompletedStartFlow: false,
      };
    } catch (error) {
      throw toAppError(error);
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
    } catch (error) {
      throw toAppError(error);
    }
  }
}
