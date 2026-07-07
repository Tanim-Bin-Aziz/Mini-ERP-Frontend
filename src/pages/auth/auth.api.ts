import { api } from '@/lib/axios';
import type { ApiEnvelope, LoginResponse } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post<ApiEnvelope<LoginResponse>>('/auth/login', payload);
    return data.data;
  },
};
