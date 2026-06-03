// MARK: - 투두 Row 컴포넌트
//
// 역할: 메인 화면의 투두 한 줄을 그리고, 인증 상세 또는 인증 작성 화면으로 이동시킵니다.
// 읽는 법: "props -> 파생 상태 -> 상세 열기 -> 인증 이동 -> render/styles" 순서로 보면 됩니다.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Todo } from '../../../models/todo';
import { useCertificationViewerStore } from '../../../stores/certificationViewerStore';
import { getTodoAccent, getTodoLeading } from '../utils';

type Props = {
  todo: Todo;
  dateOffset: number;
  currentGroupId?: number;
  queryDate: string;
  todoIds: number[];
  selectedIndex: number;
};

export function TodoRow({ todo, dateOffset, currentGroupId, queryDate, todoIds, selectedIndex }: Props) {
  // MARK: - Derived state

  const openViewer = useCertificationViewerStore((state) => state.openViewer);
  const uncertified = todo.status === 'WAIT_CERTIFICATION';
  const accent = getTodoAccent(todo.status);

  // MARK: - Open certification detail
  //
  // 이미 인증된 투두를 누르면 같은 날짜의 투두 목록을 viewer context에 담고 상세 화면으로 이동합니다.
  const handleOpenViewer = () => {
    if (!currentGroupId) {
      return;
    }

    openViewer({
      source: 'mine',
      title: '내 인증 정보',
      groupId: currentGroupId,
      date: queryDate,
      todoIds,
      selectedIndex,
    });
    router.push('/certification');
  };

  // MARK: - Go certify
  //
  // 오늘의 미인증 투두만 인증 작성 화면으로 이동할 수 있습니다.
  const handleGoCertify = () => {
    if (!currentGroupId || dateOffset < 0) {
      return;
    }

    router.push({
      pathname: '/certify',
      params: {
        todoId: String(todo.id),
        groupId: String(currentGroupId),
        date: queryDate,
        content: todo.content,
      },
    });
  };

  // MARK: - Render

  return (
    <View style={styles.todoRow}>
      <Pressable style={styles.todoRowMain} disabled={!currentGroupId} onPress={handleOpenViewer}>
        <View style={styles.todoLeft}>
          {!uncertified ? (
            <View style={[styles.todoStatusBadge, { backgroundColor: accent }]}>
              <Text style={styles.todoStatusBadgeText}>{getTodoLeading(todo.status)}</Text>
            </View>
          ) : null}
          <Text style={[styles.todoContent, uncertified && dateOffset < 0 ? styles.todoDimmed : undefined]}>
            {todo.content}
          </Text>
        </View>

        {!uncertified ? <Text style={styles.rowChevron}>›</Text> : null}
      </Pressable>

      {uncertified ? (
        <Pressable
          style={[styles.certifyButton, dateOffset < 0 ? styles.certifyButtonDisabled : undefined]}
          disabled={dateOffset < 0 || !currentGroupId}
          onPress={handleGoCertify}
        >
          <Text style={[styles.certifyText, dateOffset < 0 ? styles.certifyTextDisabled : undefined]}>인증하기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// MARK: - Styles

const styles = StyleSheet.create({
  todoRow: {
    minHeight: 56,
    borderRadius: 10,
    backgroundColor: '#2A2B31',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todoRowMain: {
    flex: 1,
    minHeight: 56,
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todoLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
  },
  todoStatusBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoStatusBadgeText: {
    color: '#111318',
    fontSize: 9,
    fontWeight: '900',
  },
  todoContent: {
    color: '#E6E9F2',
    fontSize: 14,
    fontWeight: '600',
  },
  todoDimmed: {
    color: '#8C91A7',
  },
  certifyButton: {
    minWidth: 76,
    borderRadius: 8,
    backgroundColor: '#5B9DF0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 12,
  },
  certifyButtonDisabled: {
    backgroundColor: '#595E6A',
  },
  certifyText: {
    color: '#111318',
    fontSize: 13,
    fontWeight: '800',
  },
  certifyTextDisabled: {
    color: '#A6ACBD',
  },
  rowChevron: {
    color: '#B7BDCF',
    fontSize: 22,
  },
});
