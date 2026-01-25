import type { User } from '../domain/types';
import { http } from './apiClient';

export type LoginPayload = {
  email: string
  password: string
}

export async function login(payload: LoginPayload): Promise<User> {
  const response = await http.post<User>('/login', payload)
  return response.data;
}

export async function logout(): Promise<void> {
  await http.post<User>('/logout');
}