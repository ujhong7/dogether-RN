// MARK: - Apple Auth Error Mapper
//
// 역할: Apple 로그인 SDK/native error를 앱 공통 AppError로 변환합니다.
// 읽는 법: 사용자가 취소한 경우는 null, 실제 실패는 로그인 관련 AppError로 매핑합니다.

import { getAppError } from '../../models/error';

type NativeAppleAuthError = {
  code?: string;
  message?: string;
};

function isNativeAppleAuthError(error: unknown): error is NativeAppleAuthError {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'code' in error || 'message' in error;
}

export function toAppleAuthAppError(error: unknown) {
  if (!isNativeAppleAuthError(error)) {
    return getAppError('COMMON');
  }

  const nativeCode = error.code ?? '';

  if (nativeCode === 'ERR_REQUEST_CANCELED') {
    return null;
  }

  if (
    nativeCode === 'ERR_REQUEST_FAILED' ||
    nativeCode === 'ERR_REQUEST_NOT_HANDLED' ||
    nativeCode === 'ERR_REQUEST_NOT_INTERACTIVE' ||
    nativeCode === 'ERR_REQUEST_UNKNOWN' ||
    nativeCode === 'ERR_INVALID_RESPONSE'
  ) {
    return getAppError('ATF-0005');
  }

  return getAppError('COMMON');
}
