type AppEnv = 'mock' | 'dev' | 'prod';

function normalizeAppEnv(value: string | undefined): AppEnv {
  if (value === 'dev' || value === 'prod') {
    return value;
  }

  return 'mock';
}

const appEnv = normalizeAppEnv(process.env.APP_ENV);
const appVersion = process.env.npm_package_version ?? '1.0.0';
const appDisplayName =
  appEnv === 'prod' ? 'dogether-RN' : appEnv === 'dev' ? 'dogether-RN Dev' : 'dogether-RN Mock';
const bundleSuffix = appEnv === 'prod' ? '' : '.' + appEnv;
const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY?.trim();
const enableAppleSignIn = process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN === 'true';
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
