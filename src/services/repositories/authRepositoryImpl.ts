import { endpoints } from '../api/endpoints';
import type { ApiEnvelope } from '../../types/api';
import type {
  AppleLoginPayload,
  AuthSession,
  KakaoLoginPayload,
  LoginType,
  RefreshSessionPayload,
} from '../../models/auth';
import { getAppError } from '../../models/error';
import { apiClient } from '../api/client';
import type { AuthRepository } from './contracts/authRepository';
import { toAppError } from '../errors/appError';

type AuthLoginResponse = ApiEnvelope<{
  accessToken: string;
  name: string;
}>;

export class AuthRepositoryImpl implements AuthRepository {
  async loginDemo(): Promise<AuthSession> {
    throw getAppError('COMMON');
  }

  async loginWithApple(payload: AppleLoginPayload): Promise<AuthSession> {
    return this.loginWithProvider({
      providerLoginType: 'APPLE',
      appLoginType: 'apple',
      providerId: payload.providerId,
      name: payload.name,
      appleUserIdentifier: payload.appleUserIdentifier ?? null,
    });
  }

  async loginWithKakao(payload: KakaoLoginPayload): Promise<AuthSession> {
    return this.loginWithProvider({
      providerLoginType: 'KAKAO',
      appLoginType: 'kakao',
      providerId: payload.providerId,
      name: payload.name,
    });
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

  private async loginWithProvider(payload: {
    providerLoginType: 'APPLE' | 'KAKAO';
    appLoginType: LoginType;
    providerId: string;
    name: string;
    appleUserIdentifier?: string | null;
  }): Promise<AuthSession> {
    try {
      const response = await apiClient.post<AuthLoginResponse>(endpoints.auth.login, {
        loginType: payload.providerLoginType,
        providerId: payload.providerId,
        name: payload.name,
      });

      const responseName = response.data.data?.name?.trim() ?? '';
      const shouldPreferPayloadName =
        payload.appLoginType === 'kakao' &&
        payload.name.trim().length > 0 &&
        (responseName.length === 0 || responseName === 'Kakao User');

      return {
        accessToken: response.data.data?.accessToken ?? '',
        refreshToken: null,
        userName: shouldPreferPayloadName ? payload.name : responseName || payload.name,
        loginType: payload.appLoginType,
        appleUserIdentifier: payload.appleUserIdentifier ?? null,
        hasCompletedStartFlow: false,
      };
    } catch (error) {
      throw toAppError(error);
    }
  }
}
