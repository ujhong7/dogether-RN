// MARK: - 메인 화면 Hook
//
// 역할: 메인 화면에 필요한 서버 상태, 전역 UI 상태, 파생값을 한곳에서 조합합니다.
// 읽는 법: 아래 MARK 순서대로 "상수 -> 계산 helper -> hook 내부 상태/query -> 반환값" 흐름을 따라가면 됩니다.
// iOS 비유: MainViewModel에 가까운 파일입니다. Screen은 이 hook이 정리한 값만 받아 UI를 그립니다.

import { useEffect } from 'react';
import type { Group } from '../models/group';
import type { Todo } from '../models/todo';
import { useMainStore, type TodoFilter } from '../stores/mainStore';
import { useGroupsQuery } from '../queries/useGroupsQuery';
import { useMyTodosQuery } from '../queries/useMyTodosQuery';
import { parseDate, startOfDay, getDateByOffset, formatDateByOffset } from '../lib/dateUtils';

export type MainSheetStatus = 'createTodo' | 'certificateTodo' | 'todoList' | 'emptyList' | 'done';

// MARK: - Constants

const FILTER_EMPTY_TEXT: Record<'wait' | 'approve' | 'reject', string> = {
  wait: '검사 대기 중인 투두가 없어요',
  approve: '인정 받은 투두가 없어요',
  reject: '노인정 받은 투두가 없어요',
};

// MARK: - Date range helpers

function getPastOffsetLimit(group: Group | undefined) {
  // 그룹 시작일보다 더 과거로는 이동하지 못하도록 "오늘 기준 며칠 전까지 가능한지" 계산합니다.
  const startDate = parseDate(group?.startDate);
  if (!startDate) {
    return 0;
  }

  const today = startOfDay(new Date());
  const groupStart = startOfDay(startDate);
  const diff = Math.floor((today.getTime() - groupStart.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

// MARK: - Main panel state helpers

function getSheetStatus(group: Group | undefined, dateOffset: number, todos: Todo[]): MainSheetStatus {
  // 메인 하단 패널이 어떤 상태를 보여줄지 결정합니다.
  // 같은 화면이라도 오늘/과거/투두 유무/그룹 종료 여부에 따라 CTA가 달라집니다.
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

// MARK: - Todo filter helpers

function mapTodoToFilter(todo: Todo): TodoFilter {
  // 서버 모델의 인증 상태명을 화면 필터 값으로 변환합니다.
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
  // MARK: - Zustand UI state
  //
  // React Query가 서버 데이터를 맡고, Zustand는 선택 그룹/날짜/필터 같은 화면 UI 상태를 맡습니다.
  // Zustand selector를 쓰면 필요한 상태만 구독해서 불필요한 리렌더를 줄일 수 있습니다.
  // 아래 selector 함수들은 모두 같은 패턴입니다.
  // (state) => state.selectedGroupId 는 "전체 mainStore 상태 중 selectedGroupId만 꺼내겠다"는 뜻입니다.
  const selectedGroupId = useMainStore((state) => state.selectedGroupId);
  const dateOffset = useMainStore((state) => state.dateOffset);
  const filter = useMainStore((state) => state.filter);
  const sheetExpanded = useMainStore((state) => state.sheetExpanded);
  const setSheetExpanded = useMainStore((state) => state.setSheetExpanded);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);

  // MARK: - Group query and selected group
  //
  // 그룹 목록을 서버에서 읽고, 현재 선택된 그룹 id에 맞는 Group 모델을 찾습니다.
  const groupsQuery = useGroupsQuery();

  // 선택된 그룹이 없으면 첫 번째 그룹을 기본값으로 사용합니다.
  // ?. 는 optional chaining입니다. groupsQuery.data가 undefined면 에러를 내지 않고 undefined를 반환합니다.
  // ?? 는 nullish coalescing입니다. 왼쪽 값이 null 또는 undefined일 때만 오른쪽 값을 사용합니다.
  const currentGroup = groupsQuery.data?.find((group) => group.id === selectedGroupId) ?? groupsQuery.data?.[0];

  // MARK: - Selected group correction
  //
  // 서버 그룹 목록이 바뀌었을 때 선택 상태가 유효한지 보정합니다.
  // 예: 탈퇴한 그룹 id가 store에 남아 있으면 첫 번째 그룹 또는 null로 정리합니다.
  useEffect(() => {
    // 서버에서 그룹 목록을 받아온 뒤, 저장된 selectedGroupId가 더 이상 유효하지 않으면 첫 그룹으로 보정합니다.
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

  // MARK: - Date navigation state

  const canGoPast = Math.abs(dateOffset) < getPastOffsetLimit(currentGroup);
  const canGoFuture = dateOffset < 0;

  // MARK: - Todo query
  //
  // 현재 그룹과 날짜 offset을 API 요청용 값으로 바꿔 내 투두 목록을 조회합니다.
  const todosQuery = useMyTodosQuery({
    groupId: currentGroup?.id,
    // dateOffset을 실제 API 요청용 날짜 문자열로 바꿉니다.
    date: getDateByOffset(dateOffset),
  });

  const visibleTodos = todosQuery.data ?? [];

  // MARK: - Visible todo filtering
  //
  // 서버에서 받은 전체 투두 중 현재 필터 탭에 맞는 항목만 화면에 보여줍니다.
  // filter(...)는 배열에서 조건을 통과한 요소만 남겨 새 배열을 만듭니다.
  // (todo) => { ... }는 각 todo를 검사하는 콜백 함수입니다.
  const filteredTodos = visibleTodos.filter((todo) => {
    if (filter === 'all') {
      return true;
    }
    return mapTodoToFilter(todo) === filter;
  });

  // MARK: - View model output
  //
  // Screen이 바로 사용할 값만 반환합니다. 이 return 객체가 MainScreen의 입력값이라고 보면 됩니다.
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
