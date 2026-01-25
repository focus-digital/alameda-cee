import { useMutation, useQuery } from '@tanstack/react-query';
import {
  adjudicateApplication,
  getApplications,
  submitApplication,
  withdrawApplication,
  type ApplicationPayload,
} from '../api/application-api';
import type { ApplicationStatus } from '../domain/enums';
import type { Application } from '../domain/types';
import { queryClient } from './queryClient';

const QUERY_KEY = ['applications'];

export function useApplications() {
  return useQuery<Application[]>({
    queryKey: QUERY_KEY,
    queryFn: getApplications,
  });
}

export function useSubmitApplication() {
  return useMutation({
    mutationKey: [...QUERY_KEY, 'create'],
    mutationFn: (payload: ApplicationPayload) => submitApplication(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<Application[]>(QUERY_KEY, (prev) =>
        prev ? [created, ...prev] : [created],
      );
    },
  });
}

export function useWithdrawApplication() {
  return useMutation({
    mutationKey: [...QUERY_KEY, 'withdraw'],
    mutationFn: (id: string) => withdrawApplication(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<Application[]>(QUERY_KEY, (prev) =>
        prev?.map((item) => (item.id === updated.id ? updated : item)) ?? [updated],
      );
    },
  });
}

export function useAdjudicateApplication() {
  return useMutation({
    mutationKey: [...QUERY_KEY, 'adjudicate'],
    mutationFn: (input: { id: string; status: ApplicationStatus }) =>
      adjudicateApplication(input.id, input.status),
    onSuccess: (updated) => {
      queryClient.setQueryData<Application[]>(QUERY_KEY, (prev) =>
        prev?.map((item) => (item.id === updated.id ? updated : item)) ?? [updated],
      );
    },
  });
}
