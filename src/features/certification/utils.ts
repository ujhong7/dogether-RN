import type { Todo, TodoStatus } from '../../domain/entities/todo';

export function getStatusMeta(status: TodoStatus) {
  switch (status) {
    case 'WAIT_CERTIFICATION':
      return {
        label: '미인증',
        color: '#6B7280',
      };
    case 'WAIT_APPROVAL':
      return {
        label: '검사 대기',
        color: '#E4C65A',
      };
    case 'APPROVED':
      return {
        label: '인정',
        color: '#5B9DF0',
      };
    case 'REJECTED':
      return {
        label: '노인정',
        color: '#FF4F7A',
      };
  }
}

export function getFeedbackText(todo: Todo) {
  if (todo.status === 'REJECTED') {
    return todo.reviewFeedback ?? '이 사진만으로는 확인이 어려워요. 다음에는 토스트팩, 화면이 보이게 찍어주시면 더욱 쉽게 인증할게요.';
  }

  if (todo.status === 'APPROVED') {
    return todo.reviewFeedback ?? '';
  }

  return '';
}
