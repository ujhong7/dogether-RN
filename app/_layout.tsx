import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '../src/lib/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="update" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="start" />
        <Stack.Screen name="group-add" />
        <Stack.Screen name="group-create" />
        <Stack.Screen name="group-join" />
        <Stack.Screen name="complete" />
        <Stack.Screen name="todo-write" />
        <Stack.Screen name="main" />
        <Stack.Screen name="ranking" />
        <Stack.Screen name="my" />
        <Stack.Screen name="settings" />
      </Stack>
    </QueryClientProvider>
  );
}
