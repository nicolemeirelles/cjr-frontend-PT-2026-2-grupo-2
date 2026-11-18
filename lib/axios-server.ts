import axios from 'axios';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth';

export const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});


api.interceptors.request.use(async (config) => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});