import axios, { type InternalAxiosRequestConfig } from 'axios';
import { env } from '../../config/env';
import { storage, storageKeys } from '../../lib/storage';

function readAccessToken() {
  return storage.getString(storageKeys.accessToken);
}

function applyAuthorizationHeader(config: InternalAxiosRequestConfig) {
  const accessToken = readAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(applyAuthorizationHeader);
