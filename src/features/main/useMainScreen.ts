import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GroupUseCase } from '../../domain/usecases/groupUseCase';
import { ChallengeGroupUseCase } from '../../domain/usecases/challengeGroupUseCase';
import type { Group } from '../../domain/entities/group';
import type { Todo, TodoStatus } from '../../domain/entities/todo';
import {
  createChallengeGroupRepository,
  createGroupRepository,
} from '../../data/repositories';
import { useMainStore, type TodoFilter } from '../../store/mainStore';

export type MainSheetStatus = 'createTodo' | 'certificateTodo' | 'todoList' | 'emptyList' | 'done';

const FILTER_EMPTY_TEXT: Record<'wait' | 'approve' | 'reject', string> = {
  wait: '검사 대기 중인 투두가 없어요',
  approve: '인정 받은 투두가 없어요',
  reject: '노인정 받은 투두가 없어요',
};

function getDateByOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function formatDateByOffset(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function getMockTodosForDate(group: Group | undefined, dateOffset: number, todos: Todo[]) {
  if (!group) {
    return [];
  }

  if (dateOffset === 0) {
    return todos;
  }

  if (dateOffset < 0) {
    if (group.id === 2) {
      return [];
    }

    return todos.map((todo, index): Todo => ({
      ...todo,
      id: Number(`${Math.abs(dateOffset)}${todo.id}`),
      status: (index % 2 === 0 ? 'APPROVED' : 'REJECTED') as TodoStatus,
      reviewFeedback: index % 2 === 0 ? '인증 완료' : '인증 실패',
    }));
  }

  return [];
}

function getSheetStatus(group: Group | undefined, dateOffset: number, todos: Todo[]): MainSheetStatus {
  if (!group) {
    return 'createTodo';
  }

  if (group.status === 'dDay' && dateOffset === 0) {
    return 'done';
  }

  if (dateOffset === 0 && todos.length === 0) {
    return 'createTodo';
  }

  if (dateOffset === 0) {
    return 'certificateTodo';
  }

  if (dateOffset < 0 && todos.length === 0) {
    return 'emptyList';
  }

  return 'todoList';
}

function mapTodoToFilter(todo: Todo): TodoFilter {
  switch (todo.status) {
    case 'WAIT_APPROVAL':
      return 'wait';
    case 'APPROVED':
      return 'approve';
    case 'REJECTED':
      return 'reject';
    default:
      return 'all';
  }
}

export function useMainScreen() {
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const dateOffset = useMainStore((state) => state.dateOffset);
  const filter = useMainStore((state) => state.filter);
  const sheetExpanded = useMainStore((state) => state.sheetExpanded);
  const setSheetExpanded = useMainStore((state) => state.setSheetExpanded);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);

  const groupUseCase = useMemo(() => new GroupUseCase(createGroupRepository()), []);
  const challengeGroupUseCase = useMemo(() => new ChallengeGroupUseCase(createChallengeGroupRepository()), []);

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupUseCase.getGroups(),
  });

  const currentGroup = groupsQuery.data?.find((group) => group.id === selectedGroupId) ?? groupsQuery.data?.[0];

  useEffect(() => {
    if (!groupsQuery.data?.length) {
      if (selectedGroupId !== null) {
        setSelectedGroupId(null);
      }
      return;
    }

    if (!currentGroup) {
      setSelectedGroupId(groupsQuery.data[0].id);
    }
  }, [currentGroup, groupsQuery.data, selectedGroupId, setSelectedGroupId]);
  const canGoPast = Boolean(currentGroup) && Math.abs(dateOffset) < (currentGroup?.duration ?? 0) - 1;
  const canGoFuture = dateOffset < 0;

  const todosQuery = useQuery({
    queryKey: ['todos', currentGroup?.id, dateOffset],
    enabled: Boolean(currentGroup),
    queryFn: () => challengeGroupUseCase.getMyTodos(currentGroup!.id, getDateByOffset(dateOffset)),
  });

  const visibleTodos = getMockTodosForDate(currentGroup, dateOffset, todosQuery.data ?? []);

  const filteredTodos = visibleTodos.filter((todo) => {
    if (filter === 'all') {
      return true;
    }
    return mapTodoToFilter(todo) === filter;
  });

  return {
    selectedGroupId,
    dateOffset,
    filter,
    sheetExpanded,
    setSheetExpanded,
    canGoPast,
    canGoFuture,
    formattedDate: formatDateByOffset(dateOffset),
    currentGroup,
    groupsQuery,
    todosQuery,
    sheetStatus: getSheetStatus(currentGroup, dateOffset, visibleTodos),
    visibleTodos,
    filteredTodos,
    activeFilterEmptyText: filter === 'all' ? '' : FILTER_EMPTY_TEXT[filter],
  };
}
