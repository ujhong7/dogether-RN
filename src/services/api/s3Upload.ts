import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { toByteArray } from 'base64-js';
import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { ApiEnvelope } from '../../types/api';
import { getAppError } from '../../models/error';

type PresignedUrlResponse = { presignedUrls: string[] };

// The current dev backend signs image uploads with a fixed png content-type.
const UPLOAD_CONTENT_TYPE = 'image/png';

function stripQueryString(url: string) {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url.split('?')[0] ?? url;
  }
}

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

  console.warn('[S3Upload] start', {
    originalLocalUri: localUri,
    normalizedLocalUri,
    presignedUrlHost: (() => {
      try {
        return new URL(presignedUrl).host;
      } catch {
        return presignedUrl;
      }
    })(),
  });

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
        'Content-Type': UPLOAD_CONTENT_TYPE,
      },
      body: uploadBuffer as unknown as BodyInit,
    });

    if (!uploadResponse.ok) {
      console.warn('[S3Upload] upload failed', {
        localUri: normalizedLocalUri,
        status: uploadResponse.status,
        body: await uploadResponse.text(),
        contentType: UPLOAD_CONTENT_TYPE,
      });
      throw getAppError('COMMON');
    }

    return stripQueryString(presignedUrl);
  }

  const uploadResponse = await FileSystem.uploadAsync(presignedUrl, normalizedLocalUri, {
    httpMethod: 'PUT',
    headers: {
      'Content-Type': UPLOAD_CONTENT_TYPE,
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
    console.warn('[S3Upload] upload failed', {
      localUri: normalizedLocalUri,
      status: uploadResponse.status,
      body: uploadResponse.body,
      contentType: UPLOAD_CONTENT_TYPE,
    });
    throw getAppError('COMMON');
  }

  return stripQueryString(presignedUrl);
}
