import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi, type LoginCredentials } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';

interface LoginVariables {
  credentials: LoginCredentials;
  keepSignedIn: boolean;
}

export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: ({ credentials }: LoginVariables) => authApi.login(credentials),
    onSuccess: async (data, { keepSignedIn }) => {
      await setAuth(data.user, data.accessToken, data.refreshToken, keepSignedIn);
      // RootNavigator automatically switches to MainTabs when user is set
    },
  });
}

export function useCurrentUser() {
  const { setUser, accessToken } = useAuthStore();
  const query = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.getMe(),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data]);

  return query;
}

export function useLogout() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await logout();
      // RootNavigator automatically switches to Login when user is cleared
    },
  });
}
