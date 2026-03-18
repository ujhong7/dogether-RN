import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '../src/lib/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
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
