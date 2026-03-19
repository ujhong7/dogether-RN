import { Pressable, Text, TextInput, View } from 'react-native';
import { todoWriteStyles as styles } from '../styles';
import { MAX_TODO_COUNT, MAX_TODO_LENGTH } from '../utils';

type Props = {
  draft: string;
  todoCount: number;
  isFocused: boolean;
  canAdd: boolean;
  onChangeDraft: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onAdd: () => void;
};

export function TodoInputBar({
  draft,
  todoCount,
  isFocused,
  canAdd,
  onChangeDraft,
  onFocus,
  onBlur,
  onAdd,
}: Props) {
  const placeholder =
    todoCount >= MAX_TODO_COUNT ? '모든 투두를 작성했어요!' : '예) 30분 걷기, 책 20페이지 읽기';

  return (
    <View style={styles.inputRow}>
      <View style={styles.inputWrap}>
        <TextInput
          value={draft}
          onChangeText={(text) => onChangeDraft(text.slice(0, MAX_TODO_LENGTH))}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={todoCount >= MAX_TODO_COUNT ? '#7B8090' : '#9CA3AF'}
          editable={todoCount < MAX_TODO_COUNT}
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (canAdd) {
              onAdd();
            }
          }}
          style={[
            styles.input,
            isFocused ? styles.inputFocused : undefined,
            todoCount >= MAX_TODO_COUNT ? styles.inputDisabled : undefined,
          ]}
        />
        {todoCount < MAX_TODO_COUNT ? (
          <Text style={styles.inputCount}>{draft.length}/{MAX_TODO_LENGTH}</Text>
        ) : null}
      </View>

      <Pressable
        style={[styles.addButton, canAdd ? styles.addButtonEnabled : undefined]}
        disabled={!canAdd}
        onPress={onAdd}
      >
        <Text style={[styles.addButtonIcon, canAdd ? styles.addButtonIconEnabled : undefined]}>
          {canAdd ? '+' : '♛'}
        </Text>
      </Pressable>
    </View>
  );
}
