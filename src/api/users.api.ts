import { api } from '@/lib/axios';
import type { ApiEnvelope } from '@/types';

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  name?: string;
  role?: string;
  isActive?: boolean;
  password?: string;
}

export const usersApi = {
  list: async () => {
    const { data } = await api.get<ApiEnvelope<AppUser[]>>('/users');
    return data.data;
  },

create: async (payload: CreateUserPayload) => {
  const { data } = await api.post<ApiEnvelope<AppUser>>('/users', payload);
  return data;
},

update: async (id: string, payload: UpdateUserPayload) => {
  const { data } = await api.patch<ApiEnvelope<AppUser>>(
    `/users/${id}`,
    payload
  );
  return data;
},

deactivate: async (id: string) => {
  const { data } = await api.delete<ApiEnvelope<AppUser>>(`/users/${id}`);
  return data;
},
};
