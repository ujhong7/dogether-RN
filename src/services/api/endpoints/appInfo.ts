import { child, v1 } from './path';

// MARK: - 앱 정보 API Endpoint
//
// 역할: 앱 버전/강제 업데이트 판단에 필요한 path를 정의합니다.

const appInfo = v1('/app-info');

export const appInfoEndpoints = {
  checkUpdate: child(appInfo, '/force-update-check'),
};
