import type { User } from '../domain/types';
import { http } from './apiClient';

export async function getMe(): Promise<User | null> {
  const response = await http.get<User>('/users/me')
  return response.data;
}