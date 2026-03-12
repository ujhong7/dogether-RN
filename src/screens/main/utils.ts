import type { Group } from '../../models/group';
import type { TodoFilter } from '../../stores/mainStore';

export const MAIN_FILTERS: Array<{
  key: TodoFilter;
  label: string;
  color: string;
  icon?: string;
}> = [
  { key: 'all', label: '전체', color: '#5B9DF0' },
  { key: 'wait', label: '검사 대기', color: '#E8C95F', icon: '◔' },
  { key: 'approve', label: '인정', color: '#5B9DF0', icon: '✿' },
  { key: 'reject', label: '노인정', color: '#FF4F7A', icon: '✿' },
];

export function getTodoAccent(status: string) {
  switch (status) {
    case 'WAIT_APPROVAL':
      return '#E8C95F';
    case 'APPROVED':
      return '#5B9DF0';
    case 'REJECTED':
      return '#FF4F7A';
    default:
      return '#5B9DF0';
  }
}

export function getTodoLeading(status: string) {
  switch (status) {
    case 'WAIT_APPROVAL':
      return '◔';
    case 'APPROVED':
      return '✿';
    case 'REJECTED':
      return '✿';
    default:
      return '';
  }
}

function parseGroupDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  if (/^\d{2}\.\d{2}\.\d{2}$/.test(value)) {
    const [yy, month, day] = value.split('.').map(Number);
    return new Date(2000 + yy, month - 1, day);
  }

  return null;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getProgressMeta(group?: Group) {
  if (!group) {
    return { dayLabel: '', progressPercent: 8 };
  }

  const startDate = parseGroupDate(group.startDate);
  const endDate = parseGroupDate(group.endDate);
  if (!startDate || !endDate) {
    return {
      dayLabel: `(${Math.max(1, group.duration)}일차)`,
      progressPercent: Math.max(8, group.progress * 100),
    };
  }

  const today = startOfDay(new Date());
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const totalDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
  const elapsedDays = Math.min(
    totalDays,
    Math.max(1, Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1),
  );

  return {
    dayLabel: `(${elapsedDays}일차)`,
    progressPercent: Math.max(8, (elapsedDays / totalDays) * 100),
  };
}
