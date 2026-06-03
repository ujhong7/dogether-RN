type AppEnv = 'mock' | 'dev' | 'prod';

function normalizeAppEnv(value: string | undefined): AppEnv {
  if (value === 'dev' || value === 'prod' || value === 'mock') {
    return value;
  }

  if (!value && process.env.CI !== 'true') {
    return 'mock';
  }

  throw new Error(`Invalid APP_ENV: ${value ?? '(missing)'}`);
}

function parseOptionalBoolean(value: string | undefined, name: string) {
  if (value === undefined) {
    return false;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }

  throw new Error(`Invalid ${name}: ${value}`);
}

function readOptionalTrimmed(value: string | undefined) {
  return value?.trim() || undefined;
}

function readAppVersion() {
  return process.env.npm_package_version?.trim() || '1.0.0';
}

function readKakaoNativeAppKey() {
  return readOptionalTrimmed(process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY);
}

function readEnableAppleSignIn() {
  return parseOptionalBoolean(
    process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN,
    'EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN',
  );
}

function readAppEnv() {
  return normalizeAppEnv(process.env.APP_ENV);
}

const appEnv = readAppEnv();
const appVersion = readAppVersion();
const appDisplayName =
  appEnv === 'prod' ? 'dogether-RN' : appEnv === 'dev' ? 'dogether-RN Dev' : 'dogether-RN Mock';
const bundleSuffix = appEnv === 'prod' ? '' : '.' + appEnv;
const kakaoNativeAppKey = readKakaoNativeAppKey();
const enableAppleSignIn = readEnableAppleSignIn();
const plugins: (string | [string, Record<string, unknown>])[] = ['expo-router'];

if (enableAppleSignIn) {
  plugins.push('expo-apple-authentication');
}

if (kakaoNativeAppKey) {
  plugins.push([
    '@react-native-seoul/kakao-login',
    {
      kakaoAppKey: kakaoNativeAppKey,
    },
  ]);
  plugins.push([
    'expo-build-properties',
    {
      android: {
        extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
      },
    },
  ]);
}

export default {
  expo: {
    name: appDisplayName,
    slug: 'dogether-rn',
    scheme: 'com.ujhong7.dogether' + bundleSuffix,
    version: appVersion,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      usesAppleSignIn: enableAppleSignIn,
      bundleIdentifier: 'com.ujhong7.dogether' + bundleSuffix,
    },
    android: {
      package: 'com.ujhong7.dogether' + bundleSuffix,
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins,
    extra: {
      appEnv,
    },
  },
};
