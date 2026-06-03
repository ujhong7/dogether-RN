import { child, v1 } from './path';

// MARK: - S3 API Endpoint
//
// 역할: 인증 이미지 업로드 전 presigned URL을 발급받는 path를 정의합니다.

const s3 = v1('/s3');

export const s3Endpoints = {
  presignedUrls: child(s3, '/presigned-urls'),
};
