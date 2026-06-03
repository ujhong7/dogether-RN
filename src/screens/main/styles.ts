// MARK: - 메인 화면 Panel 스타일
//
// 역할: MainPanel 전용 날짜 이동, 필터, 상태별 본문, 투두 목록, 인라인 추가 버튼 스타일입니다.
// 읽는 법: MainPanel JSX 순서와 style key 이름을 맞춰 보면 됩니다.

import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

// styles.ts는 JSX를 렌더링하지 않고 스타일 객체만 만들기 때문에 .ts를 사용합니다.
// RN의 StyleSheet.create는 SwiftUI의 View modifier 모음이나 UIKit의 style 상수 모음처럼 볼 수 있습니다.
// 화면 파일(MainScreen.tsx)에 스타일을 전부 넣지 않고 분리하면 UI 구조와 시각 스타일을 따로 읽을 수 있습니다.
/** MainPanel 전용 스타일. 각 컴포넌트 고유 스타일은 해당 파일 내부에 정의됨. */
// MARK: - Style definitions

export const mainStyles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: '#1E1F24',
    borderRadius: 14,
    padding: 12,
    minHeight: 0,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dateArrow: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#2A2C33',
  },
  dateArrowDisabled: {
    opacity: 0.35,
  },
  dateArrowText: {
    color: '#B7BDCF',
    fontSize: 18,
    fontWeight: '700',
  },
  dateTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4A4E59',
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: 'transparent',
  },
  filterIcon: {
    color: '#8C91A7',
    fontSize: 10,
  },
  filterText: {
    color: '#9EA4B5',
    fontSize: 12,
    fontWeight: '700',
  },
  filterActiveText: {
    color: '#111318',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingTop: 36,
    paddingBottom: 24,
  },
  centerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
  centerDescription: {
    color: '#8C91A7',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  primaryAction: {
    marginTop: 22,
    alignSelf: 'stretch',
    backgroundColor: '#5B9DF0',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  primaryActionText: {
    color: '#111318',
    fontWeight: '800',
    fontSize: 16,
  },
  todoSection: {
    flex: 1,
    gap: 10,
  },
  todoListScroll: {
    flex: 1,
  },
  todoListContent: {
    gap: 10,
    paddingBottom: 8,
  },
  emptyFilterState: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 12,
  },
  addTodoInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  addTodoPlus: {
    color: '#8C91A7',
    fontSize: 18,
  },
  addTodoLabel: {
    color: '#8C91A7',
    fontSize: 14,
    fontWeight: '600',
  },
});
