import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

type Props = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = false }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView> : <View style={styles.wrap}>{children}</View>}
    </SafeAreaView>
  );
}

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
