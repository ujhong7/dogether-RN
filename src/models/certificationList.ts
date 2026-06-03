// MARK: - Certification List Models
//
// 역할: 인증 목록 화면에서 사용하는 정렬값, 필터, 섹션 타입을 정의합니다.

import type { TodoStatus } from './todo';

export type CertificationListSort = 'TODO_COMPLETION_DATE' | 'GROUP_CREATION_DATE';
export type CertificationListFilter = 'all' | 'wait' | 'approve' | 'reject';

export type CertificationListItem = {
  todoId: number;
  groupId?: number;
  groupName: string;
  groupStartDate?: string;
  date: string;
  content: string;
  status: Exclude<TodoStatus, 'WAIT_CERTIFICATION'>;
  certificationMediaUrl: string;
  certificationContent?: string;
  reviewFeedback?: string;
};

export type CertificationListSection = {
  key: string;
  title: string;
  items: CertificationListItem[];
};

export type CertificationListSummary = {
  achievementCount: number;
  approvedCount: number;
  rejectedCount: number;
};

export type CertificationListData = {
  summary: CertificationListSummary;
  sections: CertificationListSection[];
};
