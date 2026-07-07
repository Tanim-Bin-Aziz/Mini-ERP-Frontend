import { api } from '@/lib/axios';
import type { ApiEnvelope, Sale } from '@/types';

export interface SaleListParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CreateSalePayload {
  customer: string;
  items: { product: string; quantity: number }[];
  discount?: number;
  tax?: number;
  paymentMethod?: 'cash' | 'card' | 'mobile_banking' | 'bank_transfer';
}

export const salesApi = {
  list: async (params: SaleListParams) => {
    const { data } = await api.get<ApiEnvelope<Sale[]>>('/sales', { params });
    return data;
  },
  create: async (payload: CreateSalePayload) => {
    const { data } = await api.post<ApiEnvelope<Sale>>('/sales', payload);
    return data.data;
  },
};
