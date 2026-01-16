import api from './api';
import { DashboardSummary, OverduePayment, UpcomingPayment } from '../types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>('/dashboard/summary');
    return data;
  },

  async getOverdue(): Promise<OverduePayment[]> {
    const { data } = await api.get<OverduePayment[]>('/dashboard/overdue');
    return data;
  },

  async getUpcoming(): Promise<UpcomingPayment[]> {
    const { data } = await api.get<UpcomingPayment[]>('/dashboard/upcoming');
    return data;
  },
};

export default dashboardService;
