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
  const openViewer = useCertificationViewerStore((state) => state.openViewer);
  const uncertified = todo.status === 'WAIT_CERTIFICATION';
  const accent = getTodoAccent(todo.status);

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
