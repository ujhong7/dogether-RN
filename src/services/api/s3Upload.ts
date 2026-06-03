// MARK: - S3 이미지 업로드
//
// 역할: 서버에서 presigned URL을 발급받고, 로컬 인증 이미지를 S3에 PUT 업로드합니다.
// 읽는 법: "URL 정리 helper -> Android URI 정규화 -> presigned URL 요청 -> 플랫폼별 업로드" 순서로 보면 됩니다.

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { toByteArray } from 'base64-js';
import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { ApiEnvelope } from '../../types/api';
import { getAppError } from '../../models/error';
import { env } from '../../config/env';

type PresignedUrlResponse = { presignedUrls: string[] };

const SUPPORTED_IMAGE_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// MARK: - Public URL helper
//
// S3 presigned URL에는 업로드 권한용 query string이 붙어 있습니다.
// 서버/화면에는 실제 이미지 주소만 저장해야 하므로 query string을 제거합니다.
function stripQueryString(url: string) {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url.split('?')[0] ?? url;
  }
}

// MARK: - Local URI normalization
//
// Android content:// URI는 fetch/FileSystem 업로드에서 바로 읽기 어려울 수 있어 cache 파일로 복사합니다.
async function normalizeLocalImageUri(localUri: string) {
  if (
    Platform.OS !== 'android' ||
    (!localUri.startsWith('content://') && !localUri.startsWith('file://'))
  ) {
    return localUri;
  }

  const cacheDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!cacheDirectory) {
    throw getAppError('COMMON');
  }

  const normalizedUri = `${cacheDirectory}certification-upload-${Date.now()}`;
  await FileSystem.copyAsync({
    from: localUri,
    to: normalizedUri,
  });

  return normalizedUri;
}

function inferContentTypeFromUri(localUri: string) {
  const normalizedUri = localUri.split('?')[0]?.toLowerCase() ?? '';
  if (normalizedUri.endsWith('.jpg') || normalizedUri.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (normalizedUri.endsWith('.png')) {
    return 'image/png';
  }
  if (normalizedUri.endsWith('.webp')) {
    return 'image/webp';
  }
  return null;
}

function resolveUploadContentType(localUri: string, contentType?: string | null) {
  const normalizedContentType = contentType?.trim().toLowerCase() || inferContentTypeFromUri(localUri);
  if (!normalizedContentType || !SUPPORTED_IMAGE_CONTENT_TYPES.has(normalizedContentType)) {
    throw getAppError('COMMON');
  }

  return normalizedContentType;
}

// MARK: - Presigned URL request
//
// 실제 파일 bytes를 서버로 보내지 않고, 서버에는 업로드 가능한 S3 URL만 요청합니다.
async function requestPresignedUrl(todoId: number) {
  const response = await apiClient.post<ApiEnvelope<PresignedUrlResponse>>(endpoints.s3.presignedUrls, {
    dailyTodoId: todoId,
    uploadFileTypes: ['IMAGE'],
  });

  const presignedUrl = response.data.data?.presignedUrls?.[0];
  if (!presignedUrl) {
    throw getAppError('COMMON');
  }

  return presignedUrl;
}

// MARK: - Upload image
//
// iOS는 FileSystem.uploadAsync를 쓰고, Android는 base64를 ArrayBuffer로 바꿔 fetch PUT을 사용합니다.
export async function uploadImageToS3(
  localUri: string,
  todoId: number,
  contentType?: string | null,
) {
  const presignedUrl = await requestPresignedUrl(todoId);
  const normalizedLocalUri = await normalizeLocalImageUri(localUri);
  const uploadContentType = resolveUploadContentType(localUri, contentType);

  if (!env.isProduction) {
    console.warn('[S3Upload] start', {
      originalLocalUri: localUri,
      normalizedLocalUri,
      contentType: uploadContentType,
      presignedUrlHost: (() => {
        try {
          return new URL(presignedUrl).host;
        } catch {
          return presignedUrl;
        }
      })(),
    });
  }

  // MARK: - Android upload

  if (Platform.OS === 'android') {
    const imageBase64 = await FileSystem.readAsStringAsync(normalizedLocalUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const uploadBytes = toByteArray(imageBase64);
    const uploadBuffer = uploadBytes.buffer.slice(
      uploadBytes.byteOffset,
      uploadBytes.byteOffset + uploadBytes.byteLength,
    );

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': uploadContentType,
      },
      body: uploadBuffer as unknown as BodyInit,
    });

    if (!uploadResponse.ok) {
      console.warn('[S3Upload] upload failed', {
        localUri: normalizedLocalUri,
        status: uploadResponse.status,
        body: await uploadResponse.text(),
        contentType: uploadContentType,
      });
      throw getAppError('COMMON');
    }

    return stripQueryString(presignedUrl);
  }

  // MARK: - iOS upload

  const uploadResponse = await FileSystem.uploadAsync(presignedUrl, normalizedLocalUri, {
    httpMethod: 'PUT',
    headers: {
      'Content-Type': uploadContentType,
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
    console.warn('[S3Upload] upload failed', {
      localUri: normalizedLocalUri,
      status: uploadResponse.status,
      body: uploadResponse.body,
      contentType: uploadContentType,
    });
    throw getAppError('COMMON');
  }

  return stripQueryString(presignedUrl);
}
