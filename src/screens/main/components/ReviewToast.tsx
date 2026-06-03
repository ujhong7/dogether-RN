// MARK: - 리뷰 완료 Toast
//
// 역할: 리뷰 처리 후 메인 화면 위에 잠깐 나타나는 완료 메시지를 렌더링합니다.

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReviewToastStore } from '../../../stores/reviewToastStore';
import { colors } from '../../../theme/colors';

export function ReviewToast() {
  const message = useReviewToastStore((state) => state.message);
  const clearToast = useReviewToastStore((state) => state.clearToast);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = setTimeout(() => {
      clearToast();
    }, 2200);

    return () => clearTimeout(timeout);
  }, [clearToast, message]);

  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✓</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 32,
    borderRadius: 14,
    backgroundColor: colors.surfaceOverlay,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '900',
  },
  text: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
