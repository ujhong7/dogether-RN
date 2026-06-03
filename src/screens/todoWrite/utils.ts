// MARK: - Todo Write Utils
//
// 역할: 투두 작성 화면의 최대 개수/글자 수와 오늘 날짜 표시값을 제공합니다.

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
