import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  userDashboard: () => [...dashboardKeys.all, 'user'] as const,
  userAlerts: () => [...dashboardKeys.all, 'user', 'alerts'] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.userDashboard(),
    queryFn: () => dashboardApi.getUserDashboard(),
    staleTime: 60000,
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: dashboardKeys.userAlerts(),
    queryFn: () => dashboardApi.getUserAlerts(),
    staleTime: 60000,
  });
}
