import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi, type LoginCredentials } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: async (data) => {
      await setAuth(data.user, data.accessToken, data.refreshToken);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    },
  });
}
