// MARK: - Update Styles
//
// 역할: 업데이트 안내 화면의 문구와 버튼 스타일을 정의합니다.

import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
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
    marginTop: 12,
    backgroundColor: colors.warning,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#111827',
    fontWeight: '700',
  },
});
