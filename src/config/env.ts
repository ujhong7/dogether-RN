type AppEnv = 'mock' | 'dev' | 'prod';

type RuntimeEnv = {
  appEnv: AppEnv;
  apiBaseUrl: string;
  appVersion: string;
  appStoreUrl: string;
  useMockApi: boolean;
  isMock: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
};

const DEFAULT_ENV_BY_APP_ENV: Record<
  AppEnv,
  Omit<RuntimeEnv, 'appEnv' | 'appVersion' | 'isMock' | 'isDevelopment' | 'isProduction'>
> = {
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

export const env: RuntimeEnv = {
  appEnv,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? defaults.apiBaseUrl,
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION ?? '1.0.0',
  appStoreUrl: process.env.EXPO_PUBLIC_APP_STORE_URL ?? defaults.appStoreUrl,
  useMockApi,
  isMock: appEnv === 'mock',
  isDevelopment: appEnv === 'dev',
  isProduction: appEnv === 'prod',
};
