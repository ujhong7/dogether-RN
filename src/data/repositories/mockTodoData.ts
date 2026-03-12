import type { Todo } from '../../domain/entities/todo';
import { storage } from '../../lib/storage';

const TODOS_KEY = 'mockTodosByGroupDate';

type TodoMap = Record<string, Todo[]>;

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
