import { appInfoEndpoints } from './appInfo';
import { authEndpoints } from './auth';
import { challengeGroupEndpoints } from './challengeGroups';
import { groupEndpoints } from './groups';
import { myEndpoints } from './my';
import { s3Endpoints } from './s3';
import { todoCertificationEndpoints } from './todoCertifications';

// MARK: - Endpoint namespace
//
// 역할: repository가 endpoints.groups.my처럼 기능별 API path를 한 진입점에서 가져오게 합니다.
// 읽는 법: 새 API 영역이 생기면 이 파일에 namespace를 추가하고, 실제 path는 개별 endpoint 파일에 둡니다.

export const endpoints = {
  appInfo: appInfoEndpoints,
  auth: authEndpoints,
  groups: groupEndpoints,
  challengeGroups: challengeGroupEndpoints,
  s3: s3Endpoints,
  my: myEndpoints,
  todoCertifications: todoCertificationEndpoints,
};
