export type ReviewResult = 'APPROVE' | 'REJECT';

export type PendingReview = {
  id: number;
  groupId: number;
  content: string;
  mediaUrl: string;
  todoContent: string;
  doer: string;
};
