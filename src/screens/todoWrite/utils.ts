export const MAX_TODO_COUNT = 10;
export const MAX_TODO_LENGTH = 20;

export function formatToday() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][now.getDay()];
  return `${month}월 ${day}일 ${weekday}`;
}

export function toQueryDate() {
  return new Date().toISOString().slice(0, 10);
}
