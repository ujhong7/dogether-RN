/** 날짜 문자열을 Date로 파싱합니다.
 * - "YYYY-MM-DD" 형식 (ISO)
 * - "YY.MM.DD" 형식 (그룹 날짜 레이블)
 */
export function parseDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year!, month! - 1, day!);
  }

  if (/^\d{2}\.\d{2}\.\d{2}$/.test(value)) {
    const [yy, month, day] = value.split('.').map(Number);
    return new Date(2000 + yy!, month! - 1, day!);
  }

  return null;
}

/** 시간을 제거하고 날짜 단위로 정규화합니다. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 오늘 기준 offset 일 후의 날짜를 "YYYY-MM-DD" 형식으로 반환합니다. */
export function getDateByOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

/** 오늘 기준 offset 일 후의 날짜를 "YYYY.MM.DD" 형식으로 반환합니다. */
export function formatDateByOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}
