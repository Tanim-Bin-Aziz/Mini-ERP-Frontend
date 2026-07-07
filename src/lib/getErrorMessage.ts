import { AxiosError } from 'axios';
import type { ApiErrorShape } from '@/types';

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorShape | undefined;
    return data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
