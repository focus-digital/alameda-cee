import { useQuery } from '@tanstack/react-query';
import { getProviders, getProviderById, type ProviderFilters } from '../api/provider-api';
import type { Provider } from '../domain/types';

const QUERY_KEY = ['providers'];

export function useProviders(filters?: ProviderFilters) {
  // Build a stable, serialized query key without mutating filter state.
  const filterKey = JSON.stringify({
    zipCode: filters?.zipCode || null,
    type: filters?.type || null,
    ageRanges: filters?.ageRanges ? [...filters.ageRanges].sort().join(',') : null,
    careTypes: filters?.careTypes ? [...filters.careTypes].sort().join(',') : null,
  });

  return useQuery<Provider[]>({
    queryKey: [...QUERY_KEY, filterKey],
    queryFn: () => getProviders(filters),
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useProvider(id: string | undefined) {
  return useQuery<Provider>({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => getProviderById(id!),
    enabled: !!id,
  });
}
