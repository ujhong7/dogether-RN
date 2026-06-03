// MARK: - 그룹 API Endpoint
//
// 역할: 그룹 관련 REST path를 한곳에 모아둡니다.
// 읽는 법: repository에서 호출하는 `endpoints.groups.xxx`가 실제 어떤 URL path인지 확인합니다.
// iOS 비유: API enum 또는 Endpoint builder에서 case별 path를 정의하는 파일입니다.
// 주요 선언: `groupEndpoints`.

import { byId, child, v1 } from './path';

const groups = v1('/groups');

export const groupEndpoints = {
  create: groups,
  join: child(groups, '/join'),
  checkParticipating: child(groups, '/participating'),
  my: child(groups, '/my'),
  lastSelected: child(groups, '/last-selected'),
  leave: (groupId: number) => byId(groups, groupId, '/leave'),
  ranking: (groupId: number) => byId(groups, groupId, '/ranking'),
};
