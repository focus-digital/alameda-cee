import type { User } from '../domain/types';
import { http } from './apiClient';

export async function getDemoUsers(): Promise<User[]> {
  const response = await http.get<User[]>('/demo/users');
  return response.data;
}

export async function resetDemoData(): Promise<void> {
  await http.post('/demo/reset');
}