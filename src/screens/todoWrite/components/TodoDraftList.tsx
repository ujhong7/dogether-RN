import { Pressable, Text, View } from 'react-native';
import type { Todo } from '../../../models/todo';
import { todoWriteStyles as styles } from '../styles';

type TodoDraftItem = {
  id: number;
  content: string;
  locked: boolean;
  status: Todo['status'];
};

type Props = {
  todos: TodoDraftItem[];
  isBootstrapping: boolean;
  onRemove: (index: number) => void;
};

export function TodoDraftList({ todos, isBootstrapping, onRemove }: Props) {
  if (todos.length === 0 && !isBootstrapping) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyFigure}>
          <View style={styles.emptyCircle} />
        </View>
        <Text style={styles.emptyTitle}>아직 작성된 투두가 없어요</Text>
        <Text style={styles.emptyDesc}>오늘 하루 이루고 싶은 목표를 입력해보세요!</Text>
      </View>
    );
  }

  return (
    <View style={styles.todoList}>
      {todos.map((todo, index) => (
        <View
          key={`${todo.id}-${index}`}
          style={[styles.todoRow, todo.locked ? styles.todoRowLocked : undefined]}
        >
          <Text
            style={[styles.todoText, todo.locked ? styles.todoTextLocked : undefined]}
            numberOfLines={1}
          >
            {todo.content}
          </Text>
          {todo.locked ? (
            <Text style={styles.lockIcon}>◔</Text>
          ) : (
            <Pressable onPress={() => onRemove(index)}>
              <Text style={styles.removeIcon}>×</Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}
