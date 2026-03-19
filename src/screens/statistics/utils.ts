export const MAX_TODOS_PER_DAY = 10;
export const BAR_MAX_HEIGHT = 176;

function parseGroupDate(dateLabel: string | undefined) {
  if (!dateLabel) {
    return null;
  }

  const [year, month, day] = dateLabel.split('.').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(2000 + year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getCurrentGroupDay(startDateLabel: string | undefined, duration: number) {
  const startDate = parseGroupDate(startDateLabel);
  if (!startDate) {
    return 1;
  }

  const today = startOfDay(new Date());
  const startDateAtMidnight = startOfDay(startDate);
  const diff = Math.floor((today.getTime() - startDateAtMidnight.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return Math.min(Math.max(diff, 1), Math.max(duration, 1));
}
