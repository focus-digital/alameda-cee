import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getInterests,
  getInterestById,
  submitInterest,
  updateInterestStatus,
  addInterestNote,
  type InterestPayload,
} from '../api/interest-api';
import type { InterestStatus } from '../domain/enums';
import type { Interest } from '../domain/types';
import { queryClient } from './queryClient';

const QUERY_KEY = ['interests'];

export function useInterests(status?: InterestStatus) {
  return useQuery<Interest[]>({
    queryKey: [...QUERY_KEY, { status }],
    queryFn: () => getInterests(status),
  });
}

export function useInterest(id: string | undefined) {
  return useQuery<Interest>({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => getInterestById(id!),
    enabled: !!id,
  });
}

export function useSubmitInterest() {
  return useMutation({
    mutationKey: [...QUERY_KEY, 'create'],
    mutationFn: (payload: InterestPayload) => submitInterest(payload),
  });
}

export function useUpdateInterestStatus() {
  return useMutation({
    mutationKey: [...QUERY_KEY, 'updateStatus'],
    mutationFn: ({ id, status }: { id: string; status: InterestStatus }) =>
      updateInterestStatus(id, status),
    onSuccess: (updated) => {
      // Update the interests list cache
      queryClient.setQueryData<Interest[]>([...QUERY_KEY, { status: undefined }], (prev) =>
        prev?.map((item) => (item.id === updated.id ? updated : item)) ?? [updated],
      );
      // Update the specific interest cache
      queryClient.setQueryData<Interest>([...QUERY_KEY, updated.id], updated);
    },
  });
}

export function useAddInterestNote() {
  return useMutation({
    mutationKey: [...QUERY_KEY, 'addNote'],
    mutationFn: ({ interestId, content }: { interestId: string; content: string }) =>
      addInterestNote(interestId, content),
    onSuccess: (_note, { interestId }) => {
      // Invalidate the specific interest to refetch with new note
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, interestId] });
    },
  });
}
