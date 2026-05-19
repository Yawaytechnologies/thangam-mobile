import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.store';
import { notificationKeys } from './useNotifications';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function useSocket() {
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !accessToken) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Join user-specific room
      socket.emit('join', { userId: user.id, role: user.role });
    });

    socket.on('notification:new', () => {
      // Invalidate notification queries on new notification
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    });

    socket.on('disconnect', () => {
      // Socket disconnected
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, accessToken, queryClient]);

  return socketRef.current;
}
