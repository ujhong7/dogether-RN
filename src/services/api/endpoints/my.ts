import { byId, child, v1, v2 } from './path';

// MARK: - 내 정보 API Endpoint
//
// 역할: 프로필, 내 인증 목록, 통계, 그룹 활동 요약 path를 정의합니다.
// 읽는 법: 일부 API는 v2를 사용하므로 myV1/myV2 base를 분리해 둡니다.

const myV1 = v1('/my');
const myV2 = v2('/my');

export const myEndpoints = {
  profile: child(myV1, '/profile'),
  certifications: child(myV2, '/certifications'),
  certificationStats: child(myV2, '/certification-stats'),
  groupActivity: (groupId: number) => child(byId(child(myV2, '/groups'), groupId), '/activity-summary'),
};
