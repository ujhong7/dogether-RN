// MARK: - Kakao Auth Error Mapper
//
// 역할: Kakao 로그인 error message를 앱 공통 AppError로 변환합니다.
// 읽는 법: 취소성 메시지는 null, 나머지는 카카오 로그인 실패 에러로 매핑합니다.

import { getAppError, type AppError } from '../../models/error';

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return '';
}

export function toKakaoAuthAppError(error: unknown): AppError | null {
  const message = extractErrorMessage(error).toLowerCase();

  if (message.includes('cancel') || message.includes('canceled') || message.includes('cancelled')) {
    return null;
  }

  return getAppError('ATF-0007');
}
