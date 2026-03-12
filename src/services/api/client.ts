import axios from 'axios';
import { env } from '../../config/env';
import { storage } from '../../lib/storage';
import { storageKeys } from '../../lib/storageKeys';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = storage.getString(storageKeys.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
