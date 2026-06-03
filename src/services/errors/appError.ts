// MARK: - API Error Mapper
//
// 역할: axios/server 에러를 화면에서 다룰 수 있는 AppError 모델로 변환합니다.
// 읽는 법: 알려진 서버 코드 목록 -> axios error 판별 -> AppError fallback 순서로 보면 됩니다.

import axios from 'axios';
import type { ApiEnvelope } from '../../types/api';
import {
  getAppError,
  isAppError,
  isAuthExpiredError,
  type AppError,
  type AppErrorCode,
} from '../../models/error';

const KNOWN_ERROR_CODES: AppErrorCode[] = [
  'ATF-0002',
  'ATF-0003',
  'ATF-0004',
  'ATF-0005',
  'ATF-0006',
  'ATF-0007',
  'CGF-0002',
  'CGF-0003',
  'CGF-0004',
  'CGF-0005',
];

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    const code = error.response?.data?.code as AppErrorCode | undefined;
    if (code && KNOWN_ERROR_CODES.includes(code)) {
      return getAppError(code);
    }
  }

  return getAppError('COMMON');
}

export function selectPreferredError(...errors: unknown[]) {
  const presentErrors = errors.filter(Boolean);

  return (
    presentErrors.find((error) => isAuthExpiredError(toAppError(error))) ??
    presentErrors[0] ??
    getAppError('COMMON')
  );
}
