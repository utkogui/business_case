import type { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado'): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message ?? fallback;
}
