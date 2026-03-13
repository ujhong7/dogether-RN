import type { Todo } from '../../models/todo';
import { storage } from '../../lib/storage';

const TODOS_KEY = 'mockTodosByGroupDate';

type TodoMap = Record<string, Todo[]>;

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

export function getMockTodos(groupId: number, date: string) {
  const todos = readTodoMap()[buildKey(groupId, date)];
  return todos ?? [];
}

export function getMockDefaultTodos(groupId: number) {
  return seededCurrentTodosByGroupId[groupId] ?? [];
}

export function setMockTodos(groupId: number, date: string, todos: Todo[]) {
  const todoMap = readTodoMap();
  todoMap[buildKey(groupId, date)] = todos;
  writeTodoMap(todoMap);
  return todos;
}

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
