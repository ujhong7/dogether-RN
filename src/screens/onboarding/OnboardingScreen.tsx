import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { useOnboarding } from '../../hooks/useOnboarding';
import { colors } from '../../theme/colors';

export function OnboardingScreen() {
  const loginMutation = useOnboarding();

  return (
    <Screen>
      <Text style={styles.title}>두게더 RN 온보딩</Text>
      <Text style={styles.description}>학습 단계에서는 데모 로그인으로 메인 플로우를 바로 경험할 수 있어요.</Text>

      <Pressable
        style={[styles.button, styles.primary]}
        onPress={() => loginMutation.mutate(undefined, { onSuccess: () => router.replace('/start') })}
      >
        <Text style={styles.buttonText}>Demo 로그인</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.ghost]}>
        <Text style={styles.ghostText}>Apple 로그인 (추가 예정)</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    color: colors.muted,
    lineHeight: 22,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonText: {
    color: '#04210E',
    fontWeight: '700',
  },
  ghostText: {
    color: colors.text,
    fontWeight: '600',
  },
});
