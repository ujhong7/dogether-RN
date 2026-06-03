import { child, v1 } from './path';

// MARK: - 인증 API Endpoint
//
// 역할: 로그인, 탈퇴, 토큰 갱신 관련 REST path를 정의합니다.

const auth = v1('/auth');

export const authEndpoints = {
  login: child(auth, '/login'),
  withdraw: child(auth, '/withdraw'),
  refresh: child(auth, '/refresh'),
};
