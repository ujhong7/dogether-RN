import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { useSessionStore } from '../../store/sessionStore';
import { useSplashFlow } from '../bootstrap/useSplashFlow';
import { colors } from '../../theme/colors';

export function SplashScreen() {
  const hydrate = useSessionStore((state) => state.hydrate);
  const { data, isLoading } = useSplashFlow();

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
