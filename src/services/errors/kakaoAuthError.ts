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
