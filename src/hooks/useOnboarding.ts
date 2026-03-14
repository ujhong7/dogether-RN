import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AuthUseCase } from '../services/usecases/authUseCase';
import { createAuthRepository } from '../services/repositories';
import { useSessionStore } from '../stores/sessionStore';
import { getAppError, type AppError } from '../models/error';
import { toAppError } from '../services/errors/appError';

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

export function useOnboarding() {
  const loginStore = useSessionStore((state) => state.login);
  const authUseCase = useMemo(() => new AuthUseCase(createAuthRepository()), []);
  const [loginError, setLoginError] = useState<AppError | null>(null);
  const [isAppleLoginAvailable, setIsAppleLoginAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;

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

  const appleLoginMutation = useMutation({
    mutationFn: async () => {
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
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === 'ERR_REQUEST_CANCELED'
      ) {
        return;
      }

      setLoginError(toAppError(error));
    },
  });

  return {
    demoLoginMutation,
    appleLoginMutation,
    isAppleLoginAvailable,
    loginError,
    clearLoginError: () => setLoginError(null),
  };
}
