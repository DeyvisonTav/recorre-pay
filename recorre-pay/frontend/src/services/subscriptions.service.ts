import api from './api';
import { Subscription, SubscriptionFormData, PaginatedResponse } from '../types';

interface SubscriptionFilters {
  page?: number;
  perPage?: number;
  status?: string;
  customerId?: string;
}

export const subscriptionsService = {
  async getAll(filters: SubscriptionFilters = {}): Promise<PaginatedResponse<Subscription>> {
    const { data } = await api.get<PaginatedResponse<Subscription>>('/subscriptions', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Subscription> {
    const { data } = await api.get<Subscription>(`/subscriptions/${id}`);
    return data;
  },

  async create(subscriptionData: SubscriptionFormData): Promise<Subscription> {
    const { data } = await api.post<Subscription>('/subscriptions', subscriptionData);
    return data;
  },

  async update(id: string, subscriptionData: Partial<SubscriptionFormData>): Promise<Subscription> {
    const { data } = await api.patch<Subscription>(`/subscriptions/${id}`, subscriptionData);
    return data;
  },

  async cancel(id: string): Promise<Subscription> {
    const { data } = await api.post<Subscription>(`/subscriptions/${id}/cancel`);
    return data;
  },

  async pause(id: string): Promise<Subscription> {
    const { data } = await api.post<Subscription>(`/subscriptions/${id}/pause`);
    return data;
  },

  async resume(id: string): Promise<Subscription> {
    const { data } = await api.post<Subscription>(`/subscriptions/${id}/resume`);
    return data;
  },
};

export default subscriptionsService;
