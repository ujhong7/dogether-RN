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
  const loginStore = useSessionStore((state) => state.login);
  const authUseCase = useMemo(() => new AuthUseCase(createAuthRepository()), []);
  const [loginError, setLoginError] = useState<AppError | null>(null);
  const [isAppleLoginAvailable, setIsAppleLoginAvailable] = useState(false);
  const [isKakaoLoginAvailable, setIsKakaoLoginAvailable] = useState(false);

  useEffect(() => {
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

  const demoLoginMutation = useMutation({
    mutationFn: () => authUseCase.loginDemo(),
    onSuccess: (data) => {
      loginStore(data);
    },
    onError: (error) => {
      setLoginError(toAppError(error));
    },
  });

  const kakaoLoginMutation = useMutation({
    mutationFn: async () => {
      if (env.useMockAuth) {
        return authUseCase.loginWithKakao({
          providerId: 'mock-kakao-user-' + Date.now(),
          name: 'Kakao User',
        });
      }

      await loginWithKakao();
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

  return {
    demoLoginMutation,
    kakaoLoginMutation,
    appleLoginMutation,
    isAppleLoginAvailable,
    isKakaoLoginAvailable,
    loginError,
    clearLoginError: () => setLoginError(null),
  };
}
