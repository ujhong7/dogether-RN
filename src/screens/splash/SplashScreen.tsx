// MARK: - 스플래시 Screen
//
// 역할: 저장된 세션을 복원하고, 앱 시작 조건을 계산해 첫 화면으로 route를 교체합니다.
// 읽는 법: "session hydrate -> launch-flow query -> route effect -> error/render" 순서로 보면 됩니다.

import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { QueryErrorState } from '../../components/QueryErrorState';
import { Screen } from '../../components/Screen';
import { useSessionStore } from '../../stores/sessionStore';
import { useLaunchFlowQuery } from '../../queries/useLaunchFlowQuery';
import { colors } from '../../theme/colors';

// SplashScreen.tsx처럼 화면을 그리는 파일은 JSX를 반환하므로 .tsx 확장자를 씁니다.
// 반대로 모델, 유틸, 스타일, store처럼 JSX가 없는 파일은 .ts를 씁니다.
export function SplashScreen() {
  // MARK: - Store and query state
  //
  // useSessionStore(...)는 Zustand 전역 저장소에서 값을 꺼내는 hook입니다.
  // 괄호 안의 (state) => state.hydrate는 "state를 받아서 state.hydrate만 반환하는 함수"입니다.
  // 즉 아래 한 줄은 "세션 store 안에 있는 hydrate 함수만 가져와서 const hydrate에 담는다"는 뜻입니다.
  //
  // 화살표 함수 기본 모양:
  // (매개변수) => 반환값
  // Swift의 클로저로 비유하면 { state in state.hydrate }와 비슷합니다.
  const hydrate = useSessionStore((state) => state.hydrate);

  // 객체 구조 분해 할당입니다.
  // useLaunchFlowQuery()가 반환한 객체에서 data, error, isError, isLoading, refetch만 꺼내 변수로 만듭니다.
  // const result = useLaunchFlowQuery(); const data = result.data; ... 를 짧게 쓴 형태입니다.
  const { data, error, isError, isLoading, refetch } = useLaunchFlowQuery();

  // MARK: - Hydrate session
  //
  // 앱 시작 직후 MMKV에 남아 있는 세션을 Zustand 메모리 상태로 복원합니다.
  useEffect(() => {
    // useEffect는 "화면이 그려진 뒤 실행할 일"을 등록하는 React hook입니다.
    // 첫 번째 인자 () => { ... } 는 나중에 React가 실행할 함수입니다.
    // 여기서는 SplashScreen이 처음 나타난 뒤 hydrate()를 호출합니다.
    // 앱 시작 직후 네이티브 저장소(MMKV)에 남아 있는 세션을 Zustand로 복원합니다.
    hydrate();
    // 두 번째 인자 [hydrate]는 의존성 배열입니다.
    // 배열 안 값이 바뀌면 이 effect가 다시 실행됩니다. hydrate가 그대로면 다시 실행하지 않습니다.
  }, [hydrate]);

  // MARK: - Route by launch result
  //
  // AppLaunchUseCase가 계산한 목적지에 따라 첫 화면을 replace합니다.
  useEffect(() => {
    // data가 바뀔 때마다 실행되는 effect입니다.
    // useLaunchFlowQuery가 비동기로 다음 화면을 계산하고 data에 넣으면, 아래 if문들이 route를 이동시킵니다.
    // useLaunchFlowQuery가 계산한 목적지에 따라 첫 화면을 교체합니다.
    // replace를 쓰면 사용자가 뒤로가기로 스플래시에 돌아오지 않습니다.
    if (!data) {
      // 아직 data가 없으면 여기서 함수를 끝냅니다. return은 "이 아래 코드는 실행하지 않겠다"는 뜻입니다.
      return;
    }

    if (data === 'update') {
      router.replace('/update');
      return;
    }

    if (data === 'review') {
      router.replace('/review');
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

  // MARK: - Error state

  if (isError) {
    return (
      <QueryErrorState
        error={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  // MARK: - Render

  return (
    <Screen>
      <Text style={styles.logo}>Dogether</Text>
      <Text style={styles.subtitle}>함께하는 데일리 투두 챌린지</Text>
      {/* 삼항 연산자입니다. 조건 ? 참일 때 값 : 거짓일 때 값 */}
      {/* isLoading이 true면 로딩 인디케이터를 보여주고, false면 null이라 아무것도 렌더링하지 않습니다. */}
      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
    </Screen>
  );
}

// MARK: - Styles

// StyleSheet.create(...)는 스타일 객체를 만드는 함수 호출입니다.
// const styles = ... 로 만들어두면 JSX에서 styles.logo처럼 꺼내 쓸 수 있습니다.
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
