import api from './axios';
import type { DashboardAlert } from '../types';

export interface UserDashboardResponse {
  totalNetwork: number;
  activeMembers: number;
  availableProperties: number;
  unreadNotifications: number;
}

export const dashboardApi = {
  getUserDashboard: (): Promise<UserDashboardResponse> =>
    api.get('/user/dashboard').then((r) => r.data.data),

  getUserAlerts: (): Promise<DashboardAlert[]> =>
    api.get('/user/dashboard/alerts').then((r) => r.data.data),
};
