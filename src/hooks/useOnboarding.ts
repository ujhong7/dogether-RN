// MARK: - 온보딩 화면 Hook
//
// 역할: 로그인 버튼들이 호출할 비동기 로그인 로직과 로그인 가능 여부 상태를 관리합니다.
// 읽는 법: OnboardingScreen은 UI만 보고, 실제 Apple/Kakao/Demo 로그인 흐름은 이 hook에서 따라갑니다.
// iOS 비유: OnboardingViewModel에 가깝습니다. 화면 이벤트를 받아 UseCase를 호출하고 화면 상태를 돌려줍니다.
// 주요 선언: `useOnboarding`, `demoLoginMutation`, `kakaoLoginMutation`, `appleLoginMutation`.

import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { getProfile, login as loginWithKakao, type KakaoProfile } from '@react-native-seoul/kakao-login';
import { AuthUseCase } from '../services/usecases/authUseCase';
import { createAuthRepository } from '../services/repositories';
import { useSessionStore } from '../stores/sessionStore';
import { getAppError, type AppError } from '../models/error';
import { toAppError } from '../services/errors/appError';
import { toAppleAuthAppError } from '../services/errors/appleAuthError';
import { toKakaoAuthAppError } from '../services/errors/kakaoAuthError';
import { env } from '../config/env';

// MARK: - Apple display name helpers
//
// Apple 로그인은 이름/이메일을 항상 주지 않으므로 표시 이름 fallback을 따로 계산합니다.
function toDisplayName(
  fullName: AppleAuthentication.AppleAuthenticationCredential['fullName'],
): string | null {
  if (!fullName) {
    return null;
  }

  const displayName = [fullName.familyName, fullName.givenName].filter(Boolean).join(' ').trim();
  return displayName.length > 0 ? displayName : null;
}

function toFallbackDisplayName(
  fullName: AppleAuthentication.AppleAuthenticationCredential['fullName'],
  email: string | null,
) {
  const displayName = toDisplayName(fullName);
  if (displayName) {
    return displayName;
  }

  if (email) {
    return email.split('@')[0] || 'Apple User';
  }

  return 'Apple User';
}

// MARK: - Native profile normalization
//
// Apple/Kakao SDK가 주는 프로필 값은 환경과 계정 상태에 따라 비어 있을 수 있습니다.
// 화면과 서버에는 항상 표시 가능한 이름을 넘기기 위해 fallback 이름을 여기서 만듭니다.
function toKakaoDisplayName(profile: KakaoProfile) {
  const normalizedName = profile.name?.trim();
  if (normalizedName) {
    return normalizedName;
  }

  const normalizedNickname = profile.nickname?.trim();
  if (normalizedNickname) {
    return normalizedNickname;
  }

  const normalizedEmail = profile.email?.trim();
  if (normalizedEmail) {
    return normalizedEmail.split('@')[0] || normalizedEmail;
  }

  return 'Kakao User';
}

export function useOnboarding() {
  // MARK: - Dependencies and local state
  //
  // UseCase, Zustand action, 화면 내부 에러/가용성 상태를 준비합니다.
  // Zustand store에서 login 함수만 꺼냅니다.
  // selector를 쓰면 세션의 다른 값이 바뀌어도 이 hook이 불필요하게 다시 렌더링되는 일을 줄일 수 있습니다.
  const loginStore = useSessionStore((state) => state.login);
  const authUseCase = useMemo(() => new AuthUseCase(createAuthRepository()), []);
  const [loginError, setLoginError] = useState<AppError | null>(null);
  const [isAppleLoginAvailable, setIsAppleLoginAvailable] = useState(false);
  const [isKakaoLoginAvailable, setIsKakaoLoginAvailable] = useState(false);

  // MARK: - Login availability check
  //
  // native SDK를 사용할 수 있는 기기/환경인지 확인해 버튼 노출 여부를 결정합니다.
  useEffect(() => {
    // useEffect는 UIKit의 viewDidLoad/viewDidAppear처럼 "렌더링 이후 실행할 작업"을 등록하는 hook입니다.
    // 여기서는 현재 기기/환경에서 Apple/Kakao 로그인이 가능한지 비동기로 확인합니다.
    if (env.useMockAuth) {
      setIsAppleLoginAvailable(env.enableAppleSignIn);
      setIsKakaoLoginAvailable(true);
      return;
    }

    let mounted = true;
    setIsKakaoLoginAvailable(Platform.OS === 'ios' || Platform.OS === 'android');

    if (!env.enableAppleSignIn) {
      setIsAppleLoginAvailable(false);
      return () => {
        mounted = false;
      };
    }

    AppleAuthentication.isAvailableAsync()
      .then((available) => {
        if (!mounted) {
          return;
        }

        setIsAppleLoginAvailable(available);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setIsAppleLoginAvailable(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // MARK: - Demo login mutation
  //
  // 개발/학습 중 빠르게 메인 플로우에 진입하기 위한 로그인입니다.
  const demoLoginMutation = useMutation({
    // mutation은 "서버 상태를 바꾸는 비동기 작업"입니다.
    // 로그인은 세션을 생성하므로 query가 아니라 mutation으로 다룹니다.
    mutationFn: () => authUseCase.loginDemo(),
    onSuccess: (data) => {
      loginStore(data);
    },
    onError: (error) => {
      setLoginError(toAppError(error));
    },
  });

  // MARK: - Kakao login mutation
  //
  // Kakao native SDK 로그인 -> Kakao profile 조회 -> 서버 로그인 순서로 진행합니다.
  const kakaoLoginMutation = useMutation({
    mutationFn: async () => {
      if (env.useMockAuth) {
        return authUseCase.loginWithKakao({
          providerId: 'mock-kakao-user-' + Date.now(),
          name: 'Kakao User',
        });
      }

      await loginWithKakao();
      // Kakao native SDK 로그인 성공 후, 프로필을 한 번 더 읽어 서버 로그인 payload를 구성합니다.
      const profile = (await getProfile()) as KakaoProfile;

      if (!profile?.id) {
        throw getAppError('ATF-0007');
      }

      return authUseCase.loginWithKakao({
        providerId: String(profile.id),
        name: toKakaoDisplayName(profile),
      });
    },
    onSuccess: (data) => {
      loginStore(data);
    },
    onError: (error) => {
      console.error('[KakaoLogin] sign in failed', error);

      const appError = toKakaoAuthAppError(error);
      if (!appError) {
        return;
      }

      setLoginError(appError);
    },
  });

  // MARK: - Apple login mutation
  //
  // AppleAuthentication credential을 받고 서버 로그인 payload로 변환합니다.
  const appleLoginMutation = useMutation({
    mutationFn: async () => {
      if (env.useMockAuth) {
        return authUseCase.loginWithApple({
          providerId: 'mock-apple-token-' + Date.now(),
          name: 'Apple User',
          authorizationCode: 'mock-authorization-code-' + Date.now(),
          appleUserIdentifier: 'mock-apple-user-' + Date.now(),
        });
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw getAppError('ATF-0004');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Apple은 최초 동의 이후 이름/이메일을 다시 주지 않을 수 있습니다.
      // 서버가 식별에 필요한 token/code가 없으면 앱 내부 에러로 바꿔 UI에서 처리합니다.
      if (!credential.identityToken || !credential.authorizationCode) {
        throw getAppError('ATF-0003');
      }

      return authUseCase.loginWithApple({
        providerId: credential.identityToken,
        name: toFallbackDisplayName(credential.fullName, credential.email),
        authorizationCode: credential.authorizationCode,
        appleUserIdentifier: credential.user,
      });
    },
    onSuccess: (data) => {
      loginStore(data);
    },
    onError: (error) => {
      console.error('[AppleLogin] sign in failed', error);

      const appError = toAppleAuthAppError(error);
      if (!appError) {
        return;
      }

      setLoginError(appError);
    },
  });

  // MARK: - Hook output
  //
  // Screen이 UI에 바로 연결할 값과 이벤트만 밖으로 공개합니다.
  return {
    // hook은 화면이 바로 사용할 값과 이벤트만 return합니다.
    // 그래서 OnboardingScreen은 SDK/Repository 세부사항을 몰라도 버튼을 연결할 수 있습니다.
    demoLoginMutation,
    kakaoLoginMutation,
    appleLoginMutation,
    isAppleLoginAvailable,
    isKakaoLoginAvailable,
    loginError,
    clearLoginError: () => setLoginError(null),
  };
}
