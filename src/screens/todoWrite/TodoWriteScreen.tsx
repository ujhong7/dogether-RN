// MARK: - 투두 작성 Screen
//
// 역할: 오늘 작성할 투두 draft를 관리하고, 저장 시 서버에 새 투두들을 등록합니다.
// 읽는 법: "타입 -> 의존성/state -> 기존 투두 bootstrap -> 추가/저장 이벤트 -> render" 순서로 보면 됩니다.

import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppErrorAlertModal } from '../../components/AppErrorAlertModal';
import { Screen } from '../../components/Screen';
import { useMainStore } from '../../stores/mainStore';
import { createChallengeGroupRepository, createGroupRepository } from '../../services/repositories';
import { toAppError } from '../../services/errors/appError';
import { ChallengeGroupUseCase } from '../../services/usecases/challengeGroupUseCase';
import { GroupUseCase } from '../../services/usecases/groupUseCase';
import type { AppError } from '../../models/error';
import type { Todo } from '../../models/todo';
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
  // MARK: - Dependencies
  //
  // 선택 그룹은 Zustand에서 읽고, 서버 갱신 후 query cache를 무효화하기 위해 queryClient를 준비합니다.
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const queryClient = useQueryClient();
  const challengeGroupUseCase = useMemo(
    () => new ChallengeGroupUseCase(createChallengeGroupRepository()),
    [],
  );
  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);

  // MARK: - Local draft state
  //
  // 이 화면에서만 필요한 입력값, 임시 투두 목록, 포커스/모달/에러 상태입니다.
  const [draft, setDraft] = useState('');
  const [todos, setTodos] = useState<TodoDraftItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [submitError, setSubmitError] = useState<AppError | null>(null);

  const trimmedDraft = draft.trim();
  const canAdd = trimmedDraft.length > 0 && todos.length < MAX_TODO_COUNT;
  const canSave = todos.some((todo) => !todo.locked);

  // MARK: - Bootstrap existing todos
  //
  // 화면 진입 시 오늘 이미 저장된 투두를 불러와 draft 목록에 섞어 보여줍니다.
  // 이미 서버에 있는 투두는 locked로 두어 새로 저장할 대상과 구분합니다.
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const groups = await groupUseCase.getGroups();
        const fallbackGroupId = groups[0]?.id;
        const groupId = selectedGroupId ?? fallbackGroupId;

        if (!groupId) {
          return;
        }

        const existingTodos = await challengeGroupUseCase.getMyTodos(groupId, toQueryDate());
        if (mounted) {
          setTodos(
            existingTodos.map((todo) => ({
              id: todo.id,
              content: todo.content,
              locked: true,
              status: todo.status,
            })),
          );
        }
      } catch (error) {
        if (mounted) {
          setSubmitError(toAppError(error));
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [challengeGroupUseCase, groupUseCase, selectedGroupId]);

  // MARK: - Add draft todo
  //
  // 입력창의 텍스트를 임시 목록 맨 앞에 추가합니다. 실제 서버 저장은 아직 하지 않습니다.
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

  // MARK: - Save todos
  //
  // locked가 아닌 새 draft만 서버에 저장하고, 성공하면 todo query를 갱신한 뒤 이전 화면으로 돌아갑니다.
  const handleSaveTodos = async () => {
    try {
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
    } catch (error) {
      setConfirmVisible(false);
      setSubmitError(toAppError(error));
    }
  };

  // MARK: - Render

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.topSection}>
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
        </View>

        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.listScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

        {submitError ? (
          <AppErrorAlertModal visible error={submitError} onClose={() => setSubmitError(null)} />
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
