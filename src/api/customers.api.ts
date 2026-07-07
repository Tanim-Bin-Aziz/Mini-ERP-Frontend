import { api } from '@/lib/axios';
import type { ApiEnvelope, Customer } from '@/types';

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export interface CustomerFormValues {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export const customersApi = {
  list: async (params: CustomerListParams) => {
    const { data } = await api.get<ApiEnvelope<Customer[]>>('/customers', { params });
    return data;
  },
  create: async (values: CustomerFormValues) => {
    const { data } = await api.post<ApiEnvelope<Customer>>('/customers', values);
    return data.data;
  },
  update: async (id: string, values: CustomerFormValues) => {
    const { data } = await api.patch<ApiEnvelope<Customer>>(`/customers/${id}`, values);
    return data.data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete<ApiEnvelope<null>>(`/customers/${id}`);
    return data;
  },
};
