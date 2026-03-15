import * as FileSystem from 'expo-file-system/legacy';
import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { ApiEnvelope } from '../../types/api';
import { getAppError } from '../../models/error';

type PresignedUrlResponse = {
  presignedUrls: string[];
};

function getContentType(uri: string) {
  const normalized = uri.toLowerCase();
  if (normalized.endsWith('.png')) {
    return 'image/png';
  }

  if (normalized.endsWith('.heic')) {
    return 'image/heic';
  }

  if (normalized.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

function stripQueryString(url: string) {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url.split('?')[0] ?? url;
  }
}

async function requestPresignedUrl() {
  const response = await apiClient.post<ApiEnvelope<PresignedUrlResponse>>(endpoints.s3.presignedUrls, {
    dailyTodoId: 0,
    uploadFileTypes: ['IMAGE'],
  });

  const presignedUrl = response.data.data?.presignedUrls?.[0];
  if (!presignedUrl) {
    throw getAppError('COMMON');
  }

  return presignedUrl;
}

export async function uploadImageToS3(localUri: string) {
  const presignedUrl = await requestPresignedUrl();
  const uploadResult = await FileSystem.uploadAsync(presignedUrl, localUri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': getContentType(localUri),
    },
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw getAppError('COMMON');
  }

  return stripQueryString(presignedUrl);
}
