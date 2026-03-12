import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../components/Screen';
import { useMainStore } from '../../store/mainStore';
import { createChallengeGroupRepository, createGroupRepository } from '../../data/repositories';
import { ChallengeGroupUseCase } from '../../domain/usecases/challengeGroupUseCase';
import { GroupUseCase } from '../../domain/usecases/groupUseCase';
import type { Todo } from '../../domain/entities/todo';
import { todoWriteStyles as styles } from './styles';
import { MAX_TODO_COUNT, toQueryDate } from './utils';
import { TodoWriteHeader } from './components/TodoWriteHeader';
import { TodoInputBar } from './components/TodoInputBar';
import { TodoDraftList } from './components/TodoDraftList';
import { TodoSaveConfirmModal } from './components/TodoSaveConfirmModal';

type TodoDraftItem = {
  id: number;
  content: string;
  locked: boolean;
  status: Todo['status'];
};

export function TodoWriteScreen() {
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const queryClient = useQueryClient();
  const challengeGroupUseCase = useMemo(
    () => new ChallengeGroupUseCase(createChallengeGroupRepository()),
    [],
  );
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  const [draft, setDraft] = useState('');
  const [todos, setTodos] = useState<TodoDraftItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const trimmedDraft = draft.trim();
  const canAdd = trimmedDraft.length > 0 && todos.length < MAX_TODO_COUNT;
  const canSave = todos.some((todo) => !todo.locked);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const groups = await groupUseCase.getGroups();
      const fallbackGroupId = groups[0]?.id;
      const groupId = selectedGroupId ?? fallbackGroupId;

      if (!groupId) {
        if (mounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      const existingTodos = await challengeGroupUseCase.getMyTodos(groupId, toQueryDate());
      if (mounted) {
        setTodos(
          existingTodos.map((todo) => ({
            id: todo.id,
            content: todo.content,
            locked: todo.status !== 'WAIT_CERTIFICATION',
            status: todo.status,
          })),
        );
        setIsBootstrapping(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [challengeGroupUseCase, groupUseCase, selectedGroupId]);

  const handleAddTodo = () => {
    if (!canAdd) {
      return;
    }

    setTodos((current) => [
      { id: Date.now(), content: trimmedDraft, locked: false, status: 'WAIT_CERTIFICATION' },
      ...current,
    ]);
    setDraft('');
  };

  const handleSaveTodos = async () => {
    const groups = await groupUseCase.getGroups();
    const fallbackGroupId = groups[0]?.id;
    const groupId = selectedGroupId ?? fallbackGroupId;
    if (!groupId) {
      setConfirmVisible(false);
      router.back();
      return;
    }

    await challengeGroupUseCase.createTodos(
      groupId,
      toQueryDate(),
      todos.filter((todo) => !todo.locked).map((todo) => todo.content),
    );
    await queryClient.invalidateQueries({ queryKey: ['todos'] });
    setConfirmVisible(false);
    router.back();
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TodoWriteHeader todoCount={todos.length} />

          <TodoInputBar
            draft={draft}
            todoCount={todos.length}
            isFocused={isFocused}
            canAdd={canAdd}
            onChangeDraft={setDraft}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onAdd={handleAddTodo}
          />

          <TodoDraftList
            todos={todos}
            isBootstrapping={isBootstrapping}
            onRemove={(index) =>
              setTodos((current) =>
                current.filter((todo, currentIndex) => currentIndex !== index || todo.locked),
              )
            }
          />
        </ScrollView>

        <Pressable
          style={[styles.saveButton, !canSave ? styles.saveButtonDisabled : undefined]}
          disabled={!canSave}
          onPress={() => setConfirmVisible(true)}
        >
          <Text style={styles.saveButtonText}>투두 저장</Text>
        </Pressable>

        <TodoSaveConfirmModal
          visible={confirmVisible}
          onCancel={() => setConfirmVisible(false)}
          onConfirm={handleSaveTodos}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
