import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

/** MainPanel 전용 스타일. 각 컴포넌트 고유 스타일은 해당 파일 내부에 정의됨. */
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
