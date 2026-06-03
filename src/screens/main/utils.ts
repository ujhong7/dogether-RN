// MARK: - 메인 화면 유틸
//
// 역할: 메인 필터 옵션, 투두 상태별 표시값, 그룹 진행률 계산 helper를 제공합니다.
// 읽는 법: "filter constants -> todo status helper -> progress helper" 순서로 보면 됩니다.

import type { Group } from '../../models/group';
import type { TodoFilter } from '../../stores/mainStore';
import { parseDate, startOfDay } from '../../lib/dateUtils';

// MARK: - Filter constants

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

// MARK: - Todo status display helpers

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

// MARK: - Group progress helper

export function getProgressMeta(group?: Group) {
  if (!group) {
    return { dayLabel: '', progressPercent: 8 };
  }

  const startDate = parseDate(group.startDate);
  const endDate = parseDate(group.endDate);
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
