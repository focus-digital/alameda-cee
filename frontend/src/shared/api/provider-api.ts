import { http } from './apiClient';
import type { Provider } from '../domain/types';
import type { ProviderType, CareType, AgeRange } from '../domain/enums';

export type ProviderFilters = {
  zipCode?: string;
  type?: ProviderType;
  careTypes?: CareType[];
  ageRanges?: AgeRange[];
};

export async function getProviders(filters?: ProviderFilters): Promise<Provider[]> {
  const params = new URLSearchParams();
  if (filters?.zipCode) params.set('zipCode', filters.zipCode);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.careTypes?.length) params.set('careTypes', filters.careTypes.join(','));
  if (filters?.ageRanges?.length) params.set('ageRanges', filters.ageRanges.join(','));

  const queryString = params.toString();
  const url = queryString ? `/providers?${queryString}` : '/providers';
  const response = await http.get<Provider[]>(url);
  return response.data;
}

export async function getProviderById(id: string): Promise<Provider> {
  const response = await http.get<Provider>(`/providers/${id}`);
  return response.data;
}
