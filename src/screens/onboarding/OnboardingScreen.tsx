// MARK: - 온보딩 Screen
//
// 역할: 로그인 시작 화면 UI를 그리고, 버튼 탭을 useOnboarding hook의 mutation에 연결합니다.
// 읽는 법: JSX 구조를 위에서 아래로 보며 어떤 버튼이 어떤 mutation을 실행하는지 확인합니다.
// iOS 비유: UIViewController + View 역할입니다. 비즈니스 로직은 hook/ViewModel 역할의 useOnboarding에 위임합니다.
// 주요 선언: `OnboardingScreen`.

import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AppAlertModal } from '../../components/AppAlertModal';
import { Screen } from '../../components/Screen';
import { useOnboarding } from '../../hooks/useOnboarding';
import { styles } from './styles';

export function OnboardingScreen() {
  // 객체 구조 분해 할당입니다.
  // useOnboarding()이 반환한 객체에서 화면에 필요한 값만 꺼내 로컬 변수로 만듭니다.
  const {
    demoLoginMutation,
    kakaoLoginMutation,
    appleLoginMutation,
    isAppleLoginAvailable,
    isKakaoLoginAvailable,
    loginError,
    clearLoginError,
  } = useOnboarding();
  // 여러 로그인 요청 중 하나라도 진행 중이면 모든 버튼을 잠가 중복 요청을 막습니다.
  const isPending =
    demoLoginMutation.isPending || kakaoLoginMutation.isPending || appleLoginMutation.isPending;

  return (
    <Screen>
      <Text style={styles.title}>두게더 RN 온보딩</Text>
      <Text style={styles.description}>학습 단계에서는 데모 로그인으로 메인 플로우를 바로 경험할 수 있어요.</Text>

      {/* onPress에는 "지금 실행한 결과"가 아니라 "나중에 터치했을 때 실행할 함수"를 넘깁니다.
          router.replace는 현재 화면을 스택에서 교체하므로 로그인 후 뒤로가기로 온보딩에 돌아오지 않습니다. */}
      <Pressable
        style={[styles.button, styles.primary, isPending ? styles.buttonDisabled : undefined]}
        disabled={isPending}
        onPress={() => demoLoginMutation.mutate(undefined, { onSuccess: () => router.replace('/splash') })}
      >
        <Text style={styles.buttonText}>Demo 로그인</Text>
      </Pressable>

      {isKakaoLoginAvailable ? (
        /* mutate는 React Query mutation을 시작하는 함수입니다.
           성공하면 세션 store가 채워지고 splash에서 다음 첫 화면을 다시 판단합니다. */
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
          {/* AppleAuthenticationButton은 Expo가 제공하는 native Apple 로그인 버튼입니다.
              일반 Pressable보다 Apple Human Interface Guidelines에 맞는 모양을 자동으로 제공합니다. */}
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
