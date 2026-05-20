import api from './axios';
import type { Member, Role, UserStatus, PaginatedResponse } from '../types';

export interface TeamParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
}

export const teamApi = {
  getTeam: (params?: TeamParams): Promise<PaginatedResponse<Member>> =>
    api.get('/members/team', { params }).then((r) => r.data.data),

  getMember: (id: string): Promise<Member> =>
    api.get(`/members/team/${id}`).then((r) => r.data.data),
};
