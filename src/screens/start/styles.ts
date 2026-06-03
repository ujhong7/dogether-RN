// MARK: - Start Styles
//
// 역할: 시작 화면의 설명 영역과 그룹 진입 카드 스타일을 정의합니다.

import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const startStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  logo: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  headerIcon: {
    color: colors.text,
    fontSize: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 30,
  },
});
