// MARK: - Group Models
//
// 역할: 그룹 목록, 생성, 참여 플로우에서 공유하는 그룹 타입을 정의합니다.

export type GroupStatus = 'ready' | 'running' | 'dDay';

export type Group = {
  id: number;
  name: string;
  currentMember: number;
  maximumMember: number;
  joinCode?: string;
  status: GroupStatus;
  duration: number;
  progress: number;
  startDate: string;
  endDate: string;
};
