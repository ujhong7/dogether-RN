export type GroupStatus = 'ready' | 'running' | 'dDay';

export type Group = {
  id: number;
  name: string;
  currentMember: number;
  maximumMember: number;
  joinCode: string;
  status: GroupStatus;
  duration: number;
  progress: number;
  startDate: string;
  endDate: string;
};
