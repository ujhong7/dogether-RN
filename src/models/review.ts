// MARK: - Review Models
//
// 역할: 인증 리뷰 화면에서 사용하는 리뷰 대상/결과 타입을 정의합니다.

export type ReviewResult = 'APPROVE' | 'REJECT';

export type PendingReview = {
  id: number;
  groupId?: number;
  content: string;
  mediaUrl: string;
  todoContent: string;
  doer: string;
};
