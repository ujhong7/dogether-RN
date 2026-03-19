import { useEffect } from 'react';
import type { Group } from '../models/group';
import type { Todo } from '../models/todo';
import { useMainStore, type TodoFilter } from '../stores/mainStore';
import { useGroupsQuery } from '../queries/useGroupsQuery';
import { useMyTodosQuery } from '../queries/useMyTodosQuery';
import { parseDate, startOfDay, getDateByOffset, formatDateByOffset } from '../lib/dateUtils';

export type MainSheetStatus = 'createTodo' | 'certificateTodo' | 'todoList' | 'emptyList' | 'done';

const FILTER_EMPTY_TEXT: Record<'wait' | 'approve' | 'reject', string> = {
  wait: '검사 대기 중인 투두가 없어요',
  approve: '인정 받은 투두가 없어요',
  reject: '노인정 받은 투두가 없어요',
};

function getPastOffsetLimit(group: Group | undefined) {
  const startDate = parseDate(group?.startDate);
  if (!startDate) {
    return 0;
  }

  // 과거 날짜 조회는 "오늘"이 아니라 그룹 시작일을 기준으로 제한한다.
  const today = startOfDay(new Date());
  const groupStart = startOfDay(startDate);
  const diff = Math.floor((today.getTime() - groupStart.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
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

  const groupsQuery = useGroupsQuery();

  const currentGroup = groupsQuery.data?.find((group) => group.id === selectedGroupId) ?? groupsQuery.data?.[0];

  useEffect(() => {
    if (!groupsQuery.data?.length) {
      if (selectedGroupId !== null) {
        setSelectedGroupId(null);
      }
      return;
    }

    // 저장된 선택 그룹이 없거나 유효하지 않으면 첫 그룹을 기본값으로 맞춘다.
    if (!currentGroup) {
      setSelectedGroupId(groupsQuery.data[0].id);
    }
  }, [currentGroup, groupsQuery.data, selectedGroupId, setSelectedGroupId]);
  const canGoPast = Math.abs(dateOffset) < getPastOffsetLimit(currentGroup);
  const canGoFuture = dateOffset < 0;

  const todosQuery = useMyTodosQuery({
    groupId: currentGroup?.id,
    date: getDateByOffset(dateOffset),
  });

  const visibleTodos = todosQuery.data ?? [];

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
    queryDate: getDateByOffset(dateOffset),
    currentGroup,
    groupsQuery,
    todosQuery,
    sheetStatus: getSheetStatus(currentGroup, dateOffset, visibleTodos),
    visibleTodos,
    filteredTodos,
    activeFilterEmptyText: filter === 'all' ? '' : FILTER_EMPTY_TEXT[filter],
  };
}
