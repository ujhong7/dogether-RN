// MARK: - Todo Models
//
// 역할: 투두 작성, 메인, 인증 화면이 공유하는 투두 타입을 정의합니다.

export type TodoStatus = 'WAIT_CERTIFICATION' | 'WAIT_APPROVAL' | 'APPROVED' | 'REJECTED';

export type Todo = {
  id: number;
  content: string;
  status: TodoStatus;
  certificationContent?: string;
  certificationMediaUrl?: string;
  reviewFeedback?: string;
};
