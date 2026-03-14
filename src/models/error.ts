export type AppErrorCode =
  | 'COMMON'
  | 'ATF-0002'
  | 'ATF-0003'
  | 'ATF-0004'
  | 'ATF-0005'
  | 'ATF-0006'
  | 'ATF-0007'
  | 'CGF-0002'
  | 'CGF-0003'
  | 'CGF-0004'
  | 'CGF-0005';

export type AppError = {
  code: AppErrorCode;
  title: string;
  message: string;
  actionLabel?: string;
  cancelLabel?: string;
  variant: 'fullScreen' | 'alert';
};

const APP_ERROR_PRESETS: Record<AppErrorCode, AppError> = {
  COMMON: {
    code: 'COMMON',
    title: '서비스 이용이 원활하지 않아요',
    message: '잠시 후 다시 접속해주세요.',
    actionLabel: '다시 시도',
    variant: 'fullScreen',
  },
  'ATF-0002': {
    code: 'ATF-0002',
    title: '로그인 연결을 해제해주세요',
    message: ['로그인이 정상적으로 진행되지 않아 Apple 계정에서 dogether 연결을 해제해야 해요. 아래 경로로 이동해 삭제한 뒤 다시 시도해주세요.', "'설정 > 내 AppleID > Apple로 로그인 > dogether > 삭제'"].join('\n\n'),
    actionLabel: '확인',
    variant: 'alert',
  },
  'ATF-0003': {
    code: 'ATF-0003',
    title: '로그인 정보가 만료됐어요',
    message: '다시 로그인해 주세요.',
    actionLabel: '확인',
    variant: 'alert',
  },
  'ATF-0004': {
    code: 'ATF-0004',
    title: 'Apple 로그인을 사용할 수 없어요',
    message: '현재 기기 또는 환경에서는 Apple 로그인을 지원하지 않아요.',
    actionLabel: '확인',
    variant: 'alert',
  },
  'ATF-0005': {
    code: 'ATF-0005',
    title: 'Apple 로그인을 완료할 수 없어요',
    message: '시뮬레이터의 Apple ID 로그인 상태나 기기 환경을 확인한 뒤 다시 시도해주세요. 문제가 계속되면 실제 기기에서 다시 확인해보세요.',
    actionLabel: '확인',
    variant: 'alert',
  },
  'ATF-0006': {
    code: 'ATF-0006',
    title: '카카오 로그인을 사용할 수 없어요',
    message: '카카오 앱 키 설정이 없어서 로그인할 수 없어요. 환경 설정을 확인해주세요.',
    actionLabel: '확인',
    variant: 'alert',
  },
  'ATF-0007': {
    code: 'ATF-0007',
    title: '카카오 로그인을 완료할 수 없어요',
    message: '카카오톡 또는 카카오 계정 상태를 확인한 뒤 다시 시도해주세요.',
    actionLabel: '확인',
    variant: 'alert',
  },
  'CGF-0002': {
    code: 'CGF-0002',
    title: '이미 참여한 그룹이에요',
    message: '해당 그룹은 다시 참여하실 수 없어요.',
    actionLabel: '확인',
    cancelLabel: '다시 입력하기',
    variant: 'alert',
  },
  'CGF-0003': {
    code: 'CGF-0003',
    title: '그룹 인원이 가득 찼어요',
    message: '다른 그룹에 참여하거나 새로 만들어주세요.',
    actionLabel: '확인',
    cancelLabel: '다시 입력하기',
    variant: 'alert',
  },
  'CGF-0004': {
    code: 'CGF-0004',
    title: '참여할 수 없는 그룹이에요',
    message: '종료되었거나 유효하지 않은 그룹이에요.',
    actionLabel: '확인',
    cancelLabel: '다시 입력하기',
    variant: 'alert',
  },
  'CGF-0005': {
    code: 'CGF-0005',
    title: '참여할 수 없는 그룹이에요',
    message: '종료되었거나 유효하지 않은 그룹이에요.',
    actionLabel: '확인',
    cancelLabel: '다시 입력하기',
    variant: 'alert',
  },
};

export function getAppError(code: AppErrorCode = 'COMMON'): AppError {
  return APP_ERROR_PRESETS[code];
}

export function isAppError(value: unknown): value is AppError {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'code' in value && 'title' in value && 'message' in value;
}
