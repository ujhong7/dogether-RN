// MARK: - 공통 API Client
//
// 역할: axios 인스턴스를 만들고 모든 서버 요청에 공통 설정을 적용합니다.
// 읽는 법: baseURL, timeout, Authorization header가 어디서 붙는지 확인할 때 봅니다.
// iOS 비유: URLSession wrapper 또는 Alamofire Session에 interceptor를 붙여둔 네트워크 진입점입니다.
// 주요 선언: `apiClient`, `applyAuthorizationHeader`.

import axios, { type InternalAxiosRequestConfig } from 'axios';
import { env } from '../../config/env';
import { storage, storageKeys } from '../../lib/storage';
import { endpoints } from './endpoints';
import type { ApiEnvelope } from '../../types/api';
import { getAppError } from '../../models/error';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = ApiEnvelope<{
  accessToken: string;
  refreshToken?: string | null;
}>;

let refreshPromise: Promise<string> | null = null;

// MARK: - Auth token lookup
//
// 서버 요청 직전에 저장소에서 최신 access token을 읽습니다.
// 앱 실행 중 로그인/로그아웃이 바뀔 수 있으므로 module load 시점에 한 번만 읽지 않습니다.
function readAccessToken() {
  // RN에서는 브라우저 localStorage 대신 MMKV 같은 네이티브 저장소를 사용합니다.
  return storage.getString(storageKeys.accessToken);
}

function readRefreshToken() {
  return storage.getString(storageKeys.refreshToken);
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = readRefreshToken();
    if (!refreshToken) {
      throw new Error('Missing refresh token');
    }

    const response = await axios.post<RefreshResponse>(
      `${env.apiBaseUrl}${endpoints.auth.refresh}`,
      { refreshToken },
      {
        timeout: 12000,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const nextAccessToken = response.data.data?.accessToken?.trim();
    if (!nextAccessToken) {
      throw new Error('Missing refreshed access token');
    }

    const nextRefreshToken = response.data.data?.refreshToken?.trim() || refreshToken;
    storage.set(storageKeys.accessToken, nextAccessToken);
    storage.set(storageKeys.refreshToken, nextRefreshToken);

    return nextAccessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// MARK: - Request interceptor
//
// repository는 "어떤 endpoint를 호출할지"에만 집중하고,
// 인증 헤더 같은 공통 관심사는 client 계층에서 한 번에 처리합니다.
function applyAuthorizationHeader(config: InternalAxiosRequestConfig) {
  const accessToken = readAccessToken();
  if (accessToken) {
    // 모든 API 요청 직전에 토큰을 붙입니다. 각 repository에서 매번 헤더를 넣지 않아도 됩니다.
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  // 모바일 네트워크는 끊길 수 있으므로, 무한 대기하지 않도록 타임아웃을 둡니다.
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// axios interceptor는 요청/응답이 실제로 나가기 전후에 공통 처리를 끼워 넣는 지점입니다.
apiClient.interceptors.request.use(applyAuthorizationHeader);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const config = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;
    const isRefreshRequest = config?.url === endpoints.auth.refresh;

    if (!config || status !== 401 || config._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(config);
    } catch {
      return Promise.reject(getAppError('ATF-0003'));
    }
  },
);
