// MARK: - Group Add Styles
//
// 역할: 그룹 추가 선택 화면의 레이아웃/카드 스타일을 정의합니다.

import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  back: {
    color: colors.text,
    fontSize: 24,
  },
  navTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  navSpacer: {
    width: 24,
  },
  cardsWrap: {
    marginTop: 8,
  },
});
