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
