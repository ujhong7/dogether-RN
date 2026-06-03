// MARK: - API Types
//
// 역할: 서버 응답 envelope처럼 네트워크 계층에서 공통으로 쓰는 타입을 정의합니다.

export type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T | null;
};
