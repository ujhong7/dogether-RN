import axios from 'axios';
import type { ApiEnvelope } from '../../types/api';
import { getAppError, isAppError, type AppError, type AppErrorCode } from '../../models/error';

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
