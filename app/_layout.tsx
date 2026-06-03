import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '../src/lib/queryClient';

// MARK: - Root Layout
//
// .tsx 파일은 TypeScript + JSX를 함께 쓰는 파일입니다.
// JSX는 <Stack>, <StatusBar />처럼 XML/HTML 태그처럼 생긴 문법이고,
// React Native 화면 컴포넌트를 반환하는 파일은 보통 .tsx 확장자를 사용합니다.
//
// app 폴더는 Expo Router가 화면 경로를 자동으로 만드는 특별한 폴더입니다.
// iOS로 비유하면 Storyboard/Coordinator가 화면 목록과 이동 구조를 알고 있는 영역에 가깝습니다.
// 예: app/main.tsx 파일은 "/main" route가 되고, app/settings.tsx 파일은 "/settings" route가 됩니다.
//
// _layout.tsx는 app 폴더 안 화면들이 공통으로 지나가는 부모 레이아웃입니다.
// 여기서는 Stack Navigator, 전역 Provider, 공통 StatusBar처럼 앱 전체에 필요한 설정을 둡니다.
export default function RootLayout() {
  return (
    // React Query가 앱 전체에서 서버 상태를 캐싱/공유할 수 있도록 최상위에 Provider를 둡니다.
    // iOS의 AppDelegate/SceneDelegate에서 전역 의존성을 주입하는 위치라고 생각하면 이해하기 쉽습니다.
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      {/* app 폴더의 파일 이름이 화면 route 이름이 됩니다. headerShown: false는 기본 네비게이션 바를 숨깁니다. */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* 앱 초기화 플로우 */}
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="update" />
        <Stack.Screen name="onboarding" />

        {/* 그룹 선택/생성 플로우 */}
        <Stack.Screen name="start" />
        <Stack.Screen name="group-add" />
        <Stack.Screen name="group-create" />
        <Stack.Screen name="group-join" />
        <Stack.Screen name="group-management" />
        <Stack.Screen name="complete" />

        {/* 메인 화면 */}
        <Stack.Screen name="main" />
        <Stack.Screen name="ranking" />
        <Stack.Screen name="statistics" />
        <Stack.Screen name="my" />
        <Stack.Screen name="settings" />

        {/* 투두 & 인증 */}
        <Stack.Screen name="todo-write" />
        <Stack.Screen name="review" options={{ gestureEnabled: false }} />
        <Stack.Screen name="certification-list" />
        <Stack.Screen name="certification" />
        <Stack.Screen name="certify" />
        <Stack.Screen name="certify-content" />
      </Stack>
    </QueryClientProvider>
  );
}
