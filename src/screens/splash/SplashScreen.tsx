import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { AppAlertModal } from '../../components/AppAlertModal';
import { Screen } from '../../components/Screen';
import { FullScreenErrorState } from '../../components/FullScreenErrorState';
import { useSessionStore } from '../../stores/sessionStore';
import { useLaunchFlowQuery } from '../../queries/useLaunchFlowQuery';
import { toAppError } from '../../services/errors/appError';
import { colors } from '../../theme/colors';

export function SplashScreen() {
  const hydrate = useSessionStore((state) => state.hydrate);
  const logout = useSessionStore((state) => state.logout);
  const { data, error, isError, isLoading, refetch } = useLaunchFlowQuery();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (data === 'update') {
      router.replace('/update');
      return;
    }

    if (data === 'onboarding') {
      router.replace('/onboarding');
      return;
    }

    if (data === 'start') {
      router.replace('/start');
      return;
    }

    router.replace('/main');
  }, [data]);

  if (isError) {
    const appError = toAppError(error);

    if (appError.variant === 'alert') {
      return (
        <Screen>
          <Text style={styles.logo}>Dogether</Text>
          <AppAlertModal
            visible
            error={appError}
            onClose={() => {
              logout();
              router.replace('/onboarding');
            }}
          />
        </Screen>
      );
    }

    return (
      <Screen>
        <FullScreenErrorState
          title={appError.title}
          message={appError.message}
          actionLabel={appError.actionLabel}
          onRetry={() => {
            void refetch();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.logo}>Dogether</Text>
      <Text style={styles.subtitle}>함께하는 데일리 투두 챌린지</Text>
      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
  },
});
