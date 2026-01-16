import api from './api';
import { Payment, PaginatedResponse } from '../types';

interface PaymentFilters {
  page?: number;
  perPage?: number;
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export const paymentsService = {
  async getAll(filters: PaymentFilters = {}): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get<PaginatedResponse<Payment>>('/payments', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Payment> {
    const { data } = await api.get<Payment>(`/payments/${id}`);
    return data;
  },

  async markAsPaid(id: string): Promise<Payment> {
    const { data } = await api.post<Payment>(`/payments/${id}/mark-paid`);
    return data;
  },

  async sendReminder(id: string): Promise<void> {
    await api.post(`/payments/${id}/send-reminder`);
  },

  async generateLink(id: string): Promise<{ paymentLink: string }> {
    const { data } = await api.post<{ paymentLink: string }>(`/payments/${id}/generate-link`);
    return data;
  },
};

export default paymentsService;
