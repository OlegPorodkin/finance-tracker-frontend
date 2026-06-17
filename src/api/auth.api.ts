import client from './client';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export async function login(data: LoginRequest): Promise<User> {
  const response = await client.post<AuthResponse>('/auth/login', data);
  return response.data.user;
}

export async function register(data: RegisterRequest): Promise<User> {
  const response = await client.post<AuthResponse>('/auth/register', data);
  return response.data.user;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

export async function refreshToken(): Promise<void> {
  await client.post('/auth/refresh');
}

export async function getMe(): Promise<User> {
  const response = await client.get<User>('/users/me');
  return response.data;
}

export async function updateMe(data: { name: string; currency: string }): Promise<User> {
  const response = await client.put<User>('/users/me', data);
  return response.data;
}
