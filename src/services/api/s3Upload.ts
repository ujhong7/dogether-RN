import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { ApiEnvelope } from '../../types/api';
import { getAppError } from '../../models/error';

type PresignedUrlResponse = {
  presignedUrls: string[];
};

function stripQueryString(url: string) {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url.split('?')[0] ?? url;
  }
}

function getUploadContentType(fileUri: string) {
  const normalizedUri = fileUri.toLowerCase();

  if (normalizedUri.endsWith('.png')) {
    return 'image/png';
  }

  if (normalizedUri.endsWith('.webp')) {
    return 'image/webp';
  }

  if (normalizedUri.endsWith('.heic')) {
    return 'image/heic';
  }

  return 'image/jpeg';
}

async function normalizeLocalImageUri(localUri: string) {
  if (Platform.OS !== 'android' || !localUri.startsWith('content://')) {
    return localUri;
  }

  const cacheDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!cacheDirectory) {
    throw getAppError('COMMON');
  }

  const normalizedUri = `${cacheDirectory}certification-upload-${Date.now()}.jpg`;
  await FileSystem.copyAsync({
    from: localUri,
    to: normalizedUri,
  });

  return normalizedUri;
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
  const normalizedLocalUri = await normalizeLocalImageUri(localUri);
  const uploadContentType = getUploadContentType(normalizedLocalUri);

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
      contentType: uploadContentType,
    });
    throw getAppError('COMMON');
  }

  return stripQueryString(presignedUrl);
}
