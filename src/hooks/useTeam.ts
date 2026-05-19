import { useQuery } from '@tanstack/react-query';
import { teamApi, type TeamParams } from '../api/team.api';

export const teamKeys = {
  all: ['team'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (params: TeamParams) => [...teamKeys.lists(), params] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

export function useTeam(params?: TeamParams) {
  return useQuery({
    queryKey: teamKeys.list(params ?? {}),
    queryFn: () => teamApi.getTeam(params),
  });
}

export function useTeamMember(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamApi.getMember(id),
    enabled: !!id,
  });
}
