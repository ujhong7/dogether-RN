import type { DurationOption, StartOption } from './types';

export function buildSchedule(label: StartOption, duration: DurationOption) {
  const start = new Date();
  if (label === '내일 시작') {
    start.setDate(start.getDate() + 1);
  }

  const durationDays =
    duration === '3일' ? 3 : duration === '1주' ? 7 : duration === '2주' ? 14 : 28;

  const end = new Date(start);
  end.setDate(start.getDate() + durationDays - 1);

  const format = (date: Date) =>
    `${String(date.getFullYear()).slice(2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
      date.getDate(),
    ).padStart(2, '0')}`;

  return {
    startAt: label === '내일 시작' ? ('TOMORROW' as const) : ('TODAY' as const),
    startLabel: format(start),
    endLabel: format(end),
    durationDays,
  };
}
