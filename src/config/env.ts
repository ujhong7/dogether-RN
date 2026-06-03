// MARK: - 앱 실행 환경 설정
//
// 역할: Expo 실행 환경 변수(process.env.EXPO_PUBLIC_*)를 앱 내부 설정 객체로 정리합니다.
// 읽는 법: mock/dev/prod 실행에서 API 주소, mock 사용 여부, 외부 로그인 가능 여부가 어떻게 결정되는지 확인합니다.
// iOS 비유: xcconfig 또는 Scheme Environment 값을 Swift 코드에서 읽어 AppConfig로 묶는 파일에 가깝습니다.
// 주요 선언: `AppEnv`, `RuntimeEnv`, `env`.

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

// MARK: - Environment parsing
//
// RN/Expo의 환경 변수는 문자열로 들어옵니다.
// 그래서 `'true'`, `'false'`, undefined를 앱에서 쓰기 쉬운 boolean/union 타입으로 바꿉니다.
function normalizeAppEnv(value: string | undefined): AppEnv {
  if (value === 'dev' || value === 'prod') {
    return value;
  }

  if (value === 'mock' || (!value && process.env.NODE_ENV !== 'production')) {
    return 'mock';
  }

  throw new Error(`Invalid EXPO_PUBLIC_APP_ENV: ${value ?? '(missing)'}`);
}

function normalizeOptionalBoolean(value: string | undefined, name: string) {
  if (value === undefined || value === 'true' || value === 'false') {
    return;
  }

  throw new Error(`Invalid ${name}: ${value}`);
}

function parseBoolean(value: string | undefined, fallback: boolean, name: string) {
  normalizeOptionalBoolean(value, name);
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return fallback;
}

function requireNonEmpty(value: string | undefined, fallback: string, name: string) {
  const normalized = value?.trim() || fallback;
  if (!normalized) {
    throw new Error(`Missing ${name}`);
  }

  return normalized;
}

function readKakaoNativeAppKey() {
  const value = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
  if (value === undefined) {
    return null;
  }

  return value.trim() || null;
}

function readAppVersion(fallback: string) {
  return requireNonEmpty(process.env.EXPO_PUBLIC_APP_VERSION, fallback, 'EXPO_PUBLIC_APP_VERSION');
}

function readApiBaseUrl(fallback: string) {
  return requireNonEmpty(process.env.EXPO_PUBLIC_API_BASE_URL, fallback, 'EXPO_PUBLIC_API_BASE_URL');
}

function readAppStoreUrl(fallback: string) {
  return requireNonEmpty(process.env.EXPO_PUBLIC_APP_STORE_URL, fallback, 'EXPO_PUBLIC_APP_STORE_URL');
}

// MARK: - Runtime env
//
// package.json의 start:mock/start:dev/start:prod 스크립트에서 주입한 값이 여기로 들어옵니다.
// EXPO_PUBLIC_ 접두사가 붙은 값만 JS bundle에서 읽을 수 있다는 점이 Expo의 중요한 규칙입니다.
const appEnv = normalizeAppEnv(process.env.EXPO_PUBLIC_APP_ENV ?? process.env.APP_ENV);
const defaults = DEFAULT_ENV_BY_APP_ENV[appEnv];
const useMockApi = parseBoolean(
  process.env.EXPO_PUBLIC_USE_MOCK_API,
  defaults.useMockApi,
  'EXPO_PUBLIC_USE_MOCK_API',
);
const useMockAppInfo = parseBoolean(
  process.env.EXPO_PUBLIC_USE_MOCK_APP_INFO,
  useMockApi,
  'EXPO_PUBLIC_USE_MOCK_APP_INFO',
);
const useMockAuth = parseBoolean(
  process.env.EXPO_PUBLIC_USE_MOCK_AUTH,
  useMockApi,
  'EXPO_PUBLIC_USE_MOCK_AUTH',
);
const useMockGroups = parseBoolean(
  process.env.EXPO_PUBLIC_USE_MOCK_GROUPS,
  useMockApi,
  'EXPO_PUBLIC_USE_MOCK_GROUPS',
);
const useMockChallengeGroups = parseBoolean(
  process.env.EXPO_PUBLIC_USE_MOCK_CHALLENGE_GROUPS,
  useMockApi,
  'EXPO_PUBLIC_USE_MOCK_CHALLENGE_GROUPS',
);
const useMockUser = parseBoolean(
  process.env.EXPO_PUBLIC_USE_MOCK_USER,
  useMockApi,
  'EXPO_PUBLIC_USE_MOCK_USER',
);
const useMockReview = parseBoolean(
  process.env.EXPO_PUBLIC_USE_MOCK_REVIEW,
  useMockApi,
  'EXPO_PUBLIC_USE_MOCK_REVIEW',
);
const kakaoNativeAppKey = readKakaoNativeAppKey();
const enableAppleSignIn = parseBoolean(
  process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN,
  false,
  'EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN',
);

export const env: RuntimeEnv = {
  appEnv,
  apiBaseUrl: readApiBaseUrl(defaults.apiBaseUrl),
  appVersion: readAppVersion('1.0.0'),
  appStoreUrl: readAppStoreUrl(defaults.appStoreUrl),
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
