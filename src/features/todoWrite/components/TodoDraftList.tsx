import { Pressable, Text, View } from 'react-native';
import { todoWriteStyles as styles } from '../styles';

type Props = {
  todos: string[];
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
        <View key={`${todo}-${index}`} style={styles.todoRow}>
          <Text style={styles.todoText} numberOfLines={1}>
            {todo}
          </Text>
          <Pressable onPress={() => onRemove(index)}>
            <Text style={styles.removeIcon}>×</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
