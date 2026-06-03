import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// MARK: - 공통 Screen Wrapper
//
// 역할: 모든 화면에 공통 safe area, 배경색, 기본 padding을 적용합니다.
// 읽는 법: scroll prop이 true면 ScrollView, false면 일반 View로 children을 감쌉니다.

type Props = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = false }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
      ) : (
        <View style={styles.wrap}>{children}</View>
      )}
    </SafeAreaView>
  );
}

// MARK: - Styles

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  wrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
});
