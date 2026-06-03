// MARK: - 투두 Mock 데이터 저장소
//
// 역할: mock 모드에서 그룹/날짜별 투두 목록을 MMKV에 저장하고, 기본 seed 데이터를 제공합니다.
// 읽는 법: "seed 데이터 -> storage helper -> 날짜별 기본값 -> CRUD 함수 -> 전체 목록/초기화" 순서로 보면 됩니다.

import type { Todo } from '../../../../models/todo';
import type { TodoStatus } from '../../../../models/todo';
import { storage } from '../../../../lib/storage';

const TODOS_KEY = 'mockTodosByGroupDate';

type TodoMap = Record<string, Todo[]>;

// MARK: - Seed data
//
// 서버 없이도 메인/인증 목록/통계 화면을 확인할 수 있도록 기본 투두를 준비합니다.
const seededCurrentTodosByGroupId: Record<number, Todo[]> = {
  101: [
    { id: 10101, content: '10분 아침 요가하기', status: 'WAIT_CERTIFICATION' },
    {
      id: 10102,
      content: '10분 아침 요가하기',
      status: 'WAIT_APPROVAL',
      certificationContent: '이 앱 보이시죠? 저 개발세끼함, ㄹㅇ',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 10103,
      content: '10분 아침 요가하기',
      status: 'REJECTED',
      certificationContent: '이 사진만으로는 확인이 어려워요.',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
      reviewFeedback: '이 사진만으로는 확인이 어려워요. 다음에는 노트북 화면이 보이게 찍어주시면 더욱 쉽게 인증할게요.',
    },
  ],
  102: [
    {
      id: 10201,
      content: '점심 과식하지 않기',
      status: 'APPROVED',
      certificationContent: '도시락 양 줄였어요',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
      reviewFeedback: '좋아요',
    },
    {
      id: 10202,
      content: '저녁 산책 20분',
      status: 'WAIT_APPROVAL',
      certificationContent: '공원 두 바퀴 돌았습니다',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=900&q=80',
    },
  ],
};

const seededHistoricalTodoMap: TodoMap = {
  '101:2025-01-02': [
    {
      id: 20101,
      content: '대단한 운동 루틴 마치기',
      status: 'WAIT_APPROVAL',
      certificationContent: '오늘 운동 인증이에요',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 20102,
      content: '단백질 챙겨 먹기',
      status: 'REJECTED',
      certificationContent: '단백질 먹었어요',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
      reviewFeedback: '사진만으로는 섭취 여부 확인이 어려워요.',
    },
    {
      id: 20103,
      content: '가벼운 스트레칭 하기',
      status: 'APPROVED',
      certificationContent: '스트레칭 완료',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=900&q=80',
      reviewFeedback: '좋아요',
    },
  ],
  '101:2025-01-03': [
    {
      id: 20104,
      content: '헬스장 출석하기',
      status: 'APPROVED',
      certificationContent: '출석 완료',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
      reviewFeedback: '좋아요',
    },
    {
      id: 20105,
      content: '하체 루틴 진행하기',
      status: 'WAIT_APPROVAL',
      certificationContent: '운동 마무리',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    },
  ],
  '102:2025-01-01': [
    {
      id: 20201,
      content: '야식 참기',
      status: 'APPROVED',
      certificationContent: '야식 안 먹었어요',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
      reviewFeedback: '좋아요',
    },
    {
      id: 20202,
      content: '저녁 8시 이후 물만 마시기',
      status: 'REJECTED',
      certificationContent: '오늘은 실패...',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
      reviewFeedback: '인증 조건이 잘 보이지 않아요.',
    },
    {
      id: 20203,
      content: '점심 메뉴 조절하기',
      status: 'APPROVED',
      certificationContent: '식단 조절 성공',
      certificationMediaUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
      reviewFeedback: '좋아요',
    },
  ],
};

// MARK: - Storage helpers
//
// mock 데이터도 앱을 재실행했을 때 유지되도록 MMKV에 JSON 문자열로 저장합니다.
function readTodoMap(): TodoMap {
  const raw = storage.getString(TODOS_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as TodoMap;
  } catch {
    return {};
  }
}

function writeTodoMap(value: TodoMap) {
  storage.set(TODOS_KEY, JSON.stringify(value));
}

function buildKey(groupId: number, date: string) {
  return `${groupId}:${date}`;
}

// MARK: - Date helpers

function getTodayDateLabel() {
  return formatDate(new Date());
}

// MARK: - Historical todo builder
//
// 오늘 seed 투두를 과거 날짜용 승인/거절 완료 데이터처럼 보이도록 변환합니다.
function buildHistoricalTodos(todos: Todo[]) {
  return todos.map((todo, index): Todo => ({
    ...todo,
    id: Number(`9${todo.id}${index}`),
    status: (index % 2 === 0 ? 'APPROVED' : 'REJECTED') as TodoStatus,
    reviewFeedback: index % 2 === 0 ? '인증 완료' : '인증 실패',
  }));
}

// MARK: - Read mock todos

export function getMockTodos(groupId: number, date: string) {
  const todos = readTodoMap()[buildKey(groupId, date)];
  return todos ?? [];
}

export function getMockDefaultTodos(groupId: number) {
  return seededCurrentTodosByGroupId[groupId] ?? [];
}

export function getMockDefaultTodosForDate(groupId: number, date: string) {
  if (date === getTodayDateLabel()) {
    return getMockDefaultTodos(groupId);
  }

  const todaysTodos = getMockDefaultTodos(groupId);
  if (todaysTodos.length === 0) {
    return [];
  }

  return buildHistoricalTodos(todaysTodos);
}

// MARK: - Write mock todos

export function setMockTodos(groupId: number, date: string, todos: Todo[]) {
  const todoMap = readTodoMap();
  todoMap[buildKey(groupId, date)] = todos;
  writeTodoMap(todoMap);
  return todos;
}

// MARK: - Create mock todos
//
// 투두 작성 화면에서 저장한 contents를 WAIT_CERTIFICATION 상태의 Todo 모델로 바꿉니다.
export function saveMockTodos(groupId: number, date: string, contents: string[]) {
  const todoMap = readTodoMap();
  const key = buildKey(groupId, date);
  const todos: Todo[] = contents.map((content, index) => ({
    id: Date.now() + index,
    content,
    status: 'WAIT_CERTIFICATION',
  }));

  todoMap[key] = todos;
  writeTodoMap(todoMap);
  return todos;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// MARK: - Read all mock todo entries
//
// 인증 목록/통계 화면은 날짜별 전체 인증 데이터를 필요로 해서 저장 데이터와 seed 데이터를 합쳐 반환합니다.
export function getAllMockTodoEntries() {
  const mergedMap: TodoMap = { ...seededHistoricalTodoMap, ...readTodoMap() };
  const todayKeyDate = formatDate(new Date());

  Object.entries(seededCurrentTodosByGroupId).forEach(([groupId, todos]) => {
    const key = buildKey(Number(groupId), todayKeyDate);
    if (!mergedMap[key]) {
      mergedMap[key] = todos;
    }
  });

  return Object.entries(mergedMap)
    .map(([key, todos]) => {
      const [groupId, date] = key.split(':');
      return {
        groupId: Number(groupId),
        date,
        todos,
      };
    })
    .sort((left, right) => {
      if (left.date === right.date) {
        return right.groupId - left.groupId;
      }
      return right.date.localeCompare(left.date);
    });
}

// MARK: - Cleanup

export function removeMockTodosByGroup(groupId: number) {
  const todoMap = readTodoMap();
  const nextTodoMap = Object.fromEntries(
    Object.entries(todoMap).filter(([key]) => !key.startsWith(`${groupId}:`)),
  );
  writeTodoMap(nextTodoMap);
}

export function resetMockTodos() {
  storage.remove(TODOS_KEY);
}
