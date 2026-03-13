import type { CertificationListFilter, CertificationListItem, CertificationListSort } from '../../models/certificationList';

export const CERTIFICATION_SORT_OPTIONS: Array<{ key: CertificationListSort; label: string }> = [
  { key: 'TODO_COMPLETION_DATE', label: '투두 완료일순' },
  { key: 'GROUP_CREATION_DATE', label: '그룹 생성일순' },
];

export const CERTIFICATION_FILTERS: Array<{
  key: CertificationListFilter;
  label: string;
  icon?: string;
  color: string;
}> = [
  { key: 'all', label: '전체', color: '#5B9DF0' },
  { key: 'wait', label: '검사 대기', icon: '◔', color: '#E6C95B' },
  { key: 'approve', label: '인정', icon: '✿', color: '#5B9DF0' },
  { key: 'reject', label: '노인정', icon: '✿', color: '#FF4F7A' },
];

export function filterCertificationItems(items: CertificationListItem[], filter: CertificationListFilter) {
  switch (filter) {
    case 'wait':
      return items.filter((item) => item.status === 'WAIT_APPROVAL');
    case 'approve':
      return items.filter((item) => item.status === 'APPROVED');
    case 'reject':
      return items.filter((item) => item.status === 'REJECTED');
    case 'all':
    default:
      return items;
  }
}

export function getCertificationEmptyTitle(filter: CertificationListFilter) {
  switch (filter) {
    case 'wait':
      return '검사 대기 중인 투두가 없어요';
    case 'approve':
      return '인정 받은 투두가 없어요';
    case 'reject':
      return '노인정 받은 투두가 없어요';
    default:
      return '아직 작성된 투두가 없어요';
  }
}

export function getCertificationBadgeMeta(status: CertificationListItem['status']) {
  switch (status) {
    case 'WAIT_APPROVAL':
      return { label: '검사 대기', color: '#E6C95B', icon: '◔' };
    case 'APPROVED':
      return { label: '인정', color: '#5B9DF0', icon: '✿' };
    case 'REJECTED':
      return { label: '노인정', color: '#FF4F7A', icon: '✿' };
  }
}
