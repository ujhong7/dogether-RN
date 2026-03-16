import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { ApiEnvelope } from '../../types/api';
import { getAppError } from '../../models/error';

type PresignedUrlResponse = {
  presignedUrls: string[];
};
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
  const localFileResponse = await fetch(localUri);
  if (!localFileResponse.ok) {
    console.warn('[S3Upload] local file read failed', localUri);
    throw getAppError('COMMON');
  }

  const imageBlob = await localFileResponse.blob();
  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': UPLOAD_CONTENT_TYPE,
    },
    body: imageBlob,
  });

  if (!uploadResponse.ok) {
    console.warn('[S3Upload] upload failed', {
      localUri,
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      contentType: UPLOAD_CONTENT_TYPE,
    });
    throw getAppError('COMMON');
  }

  return stripQueryString(presignedUrl);
}
