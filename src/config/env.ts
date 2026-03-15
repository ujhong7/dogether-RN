type AppEnv = 'mock' | 'dev' | 'prod';

type RuntimeEnv = {
  appEnv: AppEnv;
  apiBaseUrl: string;
  appVersion: string;
  appStoreUrl: string;
  kakaoNativeAppKey: string | null;
  useMockApi: boolean;
  useMockAppInfo: boolean;
  useMockAuth: boolean;
  useMockGroups: boolean;
  useMockChallengeGroups: boolean;
  useMockUser: boolean;
  useMockReview: boolean;
  isMock: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
  hasKakaoNativeAppKey: boolean;
  enableAppleSignIn: boolean;
};

type RuntimeEnvDefaults = Pick<RuntimeEnv, 'apiBaseUrl' | 'appStoreUrl' | 'useMockApi'>;

const DEFAULT_ENV_BY_APP_ENV: Record<AppEnv, RuntimeEnvDefaults> = {
  mock: {
    apiBaseUrl: 'https://api-dev.dogether.site',
    appStoreUrl: 'https://apps.apple.com',
    useMockApi: true,
  },
  dev: {
    apiBaseUrl: 'https://api-dev.dogether.site',
    appStoreUrl: 'https://apps.apple.com',
    useMockApi: false,
  },
  prod: {
    apiBaseUrl: 'https://api.dogether.site',
    appStoreUrl: 'https://apps.apple.com',
    useMockApi: false,
  },
};

function normalizeAppEnv(value: string | undefined): AppEnv {
  if (value === 'dev' || value === 'prod') {
    return value;
  }

  return 'mock';
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return fallback;
}

const appEnv = normalizeAppEnv(process.env.EXPO_PUBLIC_APP_ENV);
const defaults = DEFAULT_ENV_BY_APP_ENV[appEnv];
const useMockApi = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_API, defaults.useMockApi);
const useMockAppInfo = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_APP_INFO, useMockApi);
const useMockAuth = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_AUTH, useMockApi);
const useMockGroups = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_GROUPS, useMockApi);
const useMockChallengeGroups = parseBoolean(
  process.env.EXPO_PUBLIC_USE_MOCK_CHALLENGE_GROUPS,
  useMockApi,
);
const useMockUser = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_USER, useMockApi);
const useMockReview = parseBoolean(process.env.EXPO_PUBLIC_USE_MOCK_REVIEW, useMockApi);
const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY?.trim() || null;
const enableAppleSignIn = parseBoolean(process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN, false);

export const env: RuntimeEnv = {
  appEnv,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? defaults.apiBaseUrl,
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION ?? '1.0.0',
  appStoreUrl: process.env.EXPO_PUBLIC_APP_STORE_URL ?? defaults.appStoreUrl,
  kakaoNativeAppKey,
  useMockApi,
  useMockAppInfo,
  useMockAuth,
  useMockGroups,
  useMockChallengeGroups,
  useMockUser,
  useMockReview,
  isMock: appEnv === 'mock',
  isDevelopment: appEnv === 'dev',
  isProduction: appEnv === 'prod',
  hasKakaoNativeAppKey: Boolean(kakaoNativeAppKey),
  enableAppleSignIn,
};
