import { api } from '@/lib/axios';
import type { ApiEnvelope, DashboardStats } from '@/types';

export const dashboardApi = {
  getStats: async () => {
    const { data } = await api.get<ApiEnvelope<DashboardStats>>('/dashboard/stats');
    return data.data;
  },
  getRevenueTrend: async (days = 7) => {
    const { data } = await api.get<ApiEnvelope<{ date: string; revenue: number; orders: number }[]>>(
      '/dashboard/revenue-trend',
      { params: { days } }
    );
    return data.data;
  },
};
