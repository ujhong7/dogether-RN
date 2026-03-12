export type TodoStatus = 'WAIT_CERTIFICATION' | 'WAIT_APPROVAL' | 'APPROVED' | 'REJECTED';

export type Todo = {
  id: number;
  content: string;
  status: TodoStatus;
  certificationContent?: string;
  certificationMediaUrl?: string;
  reviewFeedback?: string;
};
