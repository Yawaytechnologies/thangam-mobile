import api from './axios';
import type {
  Notification,
  NotificationRecipient,
  NotificationType,
  NotificationStatus,
  PaginatedResponse,
} from '../types';

export interface NotificationParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  status?: NotificationStatus;
  dateFilter?: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
}

export interface UnreadCountResponse {
  count: number;
}

// Only for Director role
export const notificationsApi = {
  getAll: (params?: NotificationParams): Promise<PaginatedResponse<NotificationRecipient>> =>
    api.get('/notifications', { params }).then((r) => r.data.data),

  getOne: (id: string): Promise<Notification> =>
    api.get(`/notifications/${id}`).then((r) => r.data.data),

  getUnreadCount: (): Promise<UnreadCountResponse> =>
    api.get('/notifications/unread-count').then((r) => r.data.data),

  markRead: (id: string): Promise<NotificationRecipient> =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data.data),
};
