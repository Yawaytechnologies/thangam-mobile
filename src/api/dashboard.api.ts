import api from './axios';
import type { MemberDashboardStats, DashboardAlert, RecentPropertyWorkflow } from '../types';

export interface UserDashboardResponse {
  stats: MemberDashboardStats;
  recentProperties: RecentPropertyWorkflow[];
}

export const dashboardApi = {
  getUserDashboard: (): Promise<UserDashboardResponse> =>
    api.get('/dashboard/user').then((r) => r.data.data),

  getUserAlerts: (): Promise<DashboardAlert[]> =>
    api.get('/dashboard/user/alerts').then((r) => r.data.data),
};
