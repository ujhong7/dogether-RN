import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AppAlertModal } from '../../components/AppAlertModal';
import { Screen } from '../../components/Screen';
import { useOnboarding } from '../../hooks/useOnboarding';
import { colors } from '../../theme/colors';

export function OnboardingScreen() {
  const {
    demoLoginMutation,
    kakaoLoginMutation,
    appleLoginMutation,
    isAppleLoginAvailable,
    isKakaoLoginAvailable,
    loginError,
    clearLoginError,
  } = useOnboarding();
  const isPending =
    demoLoginMutation.isPending || kakaoLoginMutation.isPending || appleLoginMutation.isPending;

  return (
    <Screen>
      <Text style={styles.title}>두게더 RN 온보딩</Text>
      <Text style={styles.description}>학습 단계에서는 데모 로그인으로 메인 플로우를 바로 경험할 수 있어요.</Text>

      <Pressable
        style={[styles.button, styles.primary, isPending ? styles.buttonDisabled : undefined]}
        disabled={isPending}
        onPress={() => demoLoginMutation.mutate(undefined, { onSuccess: () => router.replace('/splash') })}
      >
        <Text style={styles.buttonText}>Demo 로그인</Text>
      </Pressable>

      {isKakaoLoginAvailable ? (
        <Pressable
          style={[styles.button, styles.kakao, isPending ? styles.buttonDisabled : undefined]}
          disabled={isPending}
          onPress={() => kakaoLoginMutation.mutate(undefined, { onSuccess: () => router.replace('/splash') })}
        >
          <Text style={styles.kakaoText}>카카오로 시작하기</Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.button, styles.ghost, styles.buttonDisabled]} disabled>
          <Text style={styles.ghostText}>카카오 로그인을 사용할 수 없는 환경입니다</Text>
        </Pressable>
      )}

      {isAppleLoginAvailable ? (
        <View style={styles.appleButtonWrapper}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={12}
            style={styles.appleButton}
            onPress={() => appleLoginMutation.mutate(undefined, { onSuccess: () => router.replace('/splash') })}
          />
        </View>
      ) : (
        <Pressable style={[styles.button, styles.ghost, styles.buttonDisabled]} disabled>
          <Text style={styles.ghostText}>Apple 로그인을 사용할 수 없는 환경입니다</Text>
        </Pressable>
      )}

      <AppAlertModal
        visible={Boolean(loginError)}
        error={loginError ?? { code: 'ATF-0003', title: '', message: '', variant: 'alert' }}
        onClose={clearLoginError}
      />
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
  kakao: {
    backgroundColor: '#FEE500',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  appleButtonWrapper: {
    marginTop: 6,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  buttonText: {
    color: '#04210E',
    fontWeight: '700',
  },
  kakaoText: {
    color: '#181600',
    fontWeight: '700',
  },
  ghostText: {
    color: colors.text,
    fontWeight: '600',
  },
});
