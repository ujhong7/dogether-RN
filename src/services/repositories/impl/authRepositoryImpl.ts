// MARK: - 인증 API Repository 구현
//
// 역할: AuthRepository interface를 실제 로그인/토큰 갱신 API로 구현합니다.
// 읽는 법: "응답 타입 -> provider별 public method -> 공통 loginWithProvider" 순서로 보면 됩니다.

import { endpoints } from '../../api/endpoints';
import type { ApiEnvelope } from '../../../types/api';
import type {
  AppleLoginPayload,
  AuthSession,
  KakaoLoginPayload,
  LoginType,
  RefreshSessionPayload,
} from '../../../models/auth';
import { getAppError } from '../../../models/error';
import { apiClient } from '../../api/client';
import type { AuthRepository } from '../contracts/authRepository';
import { toAppError } from '../../errors/appError';

type AuthLoginResponse = ApiEnvelope<{
  accessToken: string;
  refreshToken?: string | null;
  name: string;
}>;

function requireToken(value: string | null | undefined) {
  const token = value?.trim();
  if (!token) {
    throw getAppError('COMMON');
  }

  return token;
}

export class AuthRepositoryImpl implements AuthRepository {
  // MARK: - Demo login
  //
  // 실제 API 모드에서는 데모 로그인을 지원하지 않으므로 공통 에러를 던집니다.
  async loginDemo(): Promise<AuthSession> {
    throw getAppError('COMMON');
  }

  // MARK: - Apple login

  async loginWithApple(payload: AppleLoginPayload): Promise<AuthSession> {
    return this.loginWithProvider({
      providerLoginType: 'APPLE',
      appLoginType: 'apple',
      providerId: payload.providerId,
      name: payload.name,
      appleUserIdentifier: payload.appleUserIdentifier ?? null,
    });
  }

  // MARK: - Kakao login

  async loginWithKakao(payload: KakaoLoginPayload): Promise<AuthSession> {
    return this.loginWithProvider({
      providerLoginType: 'KAKAO',
      appLoginType: 'kakao',
      providerId: payload.providerId,
      name: payload.name,
    });
  }

  // MARK: - Refresh session

  async refreshSession(refreshToken: string): Promise<RefreshSessionPayload> {
    try {
      const response = await apiClient.post<
        ApiEnvelope<{ accessToken: string; refreshToken?: string | null }>
      >(endpoints.auth.refresh, { refreshToken });

      const accessToken = requireToken(response.data.data?.accessToken);
      const nextRefreshToken = response.data.data?.refreshToken?.trim() || refreshToken;

      return { accessToken, refreshToken: nextRefreshToken };
    } catch (error) {
      throw toAppError(error);
    }
  }

  // MARK: - Withdraw

  async withdraw(): Promise<void> {
    try {
      await apiClient.delete<ApiEnvelope<null>>(endpoints.auth.withdraw);
    } catch (error) {
      throw toAppError(error);
    }
  }

  // MARK: - Provider login
  //
  // Apple/Kakao가 다른 SDK payload를 주지만, 서버 로그인 endpoint는 같은 형태로 호출합니다.
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

      const accessToken = requireToken(response.data.data?.accessToken);
      const refreshToken = response.data.data?.refreshToken?.trim() || null;

      return {
        accessToken,
        refreshToken,
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
