// MARK: - Splash Styles
//
// 역할: 스플래시 화면의 로고, 안내 문구, 로딩 상태 스타일을 정의합니다.

import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
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
