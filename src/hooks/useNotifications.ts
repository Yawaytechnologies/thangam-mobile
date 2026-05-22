import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationParams } from '../api/notifications.api';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: NotificationParams) => [...notificationKeys.lists(), params] as const,
  infiniteLists: () => [...notificationKeys.all, 'infinite-list'] as const,
  infiniteList: (params: Omit<NotificationParams, 'page'>) => [...notificationKeys.infiniteLists(), params] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function useNotifications(params?: NotificationParams) {
  return useQuery({
    queryKey: notificationKeys.list(params ?? {}),
    queryFn: () => notificationsApi.getAll(params),
  });
}

export function useInfiniteNotifications(params?: Omit<NotificationParams, 'page'>) {
  const limit = 20;
  return useInfiniteQuery({
    queryKey: notificationKeys.infiniteList(params ?? {}),
    queryFn: ({ pageParam }) => notificationsApi.getAll({ ...params, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationsApi.getOne(id),
    enabled: !!id,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}
