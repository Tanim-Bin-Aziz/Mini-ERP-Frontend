import { api } from '@/lib/axios';
import type { ApiEnvelope, Product } from '@/types';

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}

export interface ProductFormValues {
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  unit?: string;
  description?: string;
  image?: FileList;
}

const toFormData = (values: ProductFormValues) => {
  const fd = new FormData();
  fd.append('name', values.name);
  fd.append('sku', values.sku);
  fd.append('category', values.category);
  fd.append('price', String(values.price));
  if (values.costPrice !== undefined) fd.append('costPrice', String(values.costPrice));
  fd.append('stock', String(values.stock));
  if (values.lowStockThreshold !== undefined)
    fd.append('lowStockThreshold', String(values.lowStockThreshold));
  if (values.unit) fd.append('unit', values.unit);
  if (values.description) fd.append('description', values.description);
  if (values.image && values.image.length > 0) {
    fd.append('images', values.image[0]);
  }
  return fd;
};

export const productsApi = {
  list: async (params: ProductListParams) => {
    const { data } = await api.get<ApiEnvelope<Product[]>>('/products', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<ApiEnvelope<Product>>(`/products/${id}`);
    return data.data;
  },
  create: async (values: ProductFormValues) => {
    const { data } = await api.post<ApiEnvelope<Product>>('/products', toFormData(values), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  update: async (id: string, values: ProductFormValues) => {
    const { data } = await api.patch<ApiEnvelope<Product>>(`/products/${id}`, toFormData(values), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete<ApiEnvelope<null>>(`/products/${id}`);
    return data;
  },
};
