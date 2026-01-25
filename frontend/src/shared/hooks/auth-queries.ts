import { useMutation, useQuery } from '@tanstack/react-query'
import { login, logout, type LoginPayload } from '../api/auth-api'
import type { User } from '../domain/types';
import { getMe } from '../api/user-api';
import { queryClient } from './queryClient';

type UseAuthResult = {
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
  // Current user
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (loggedInUser: User) => {
      // Keep /me cache in sync
      queryClient.setQueryData(['me'], loggedInUser);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: () => logout(),
    onSuccess: () => {
      // Clear user from cache
      queryClient.setQueryData(['me'], null);
    },
  });

  // Public API: only expose what you asked for
  return {
    user: user ?? null,
    isAuthenticated: !!user,
    login: async (payload: LoginPayload) => {
      const result = await loginMutation.mutateAsync(payload);
      return result;
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
  };
}