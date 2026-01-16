import api from './api';
import { Plan, PlanFormData } from '../types';

export const plansService = {
  async getAll(): Promise<Plan[]> {
    const { data } = await api.get<Plan[]>('/plans');
    return data;
  },

  async getById(id: string): Promise<Plan> {
    const { data } = await api.get<Plan>(`/plans/${id}`);
    return data;
  },

  async create(planData: PlanFormData): Promise<Plan> {
    const { data } = await api.post<Plan>('/plans', planData);
    return data;
  },

  async update(id: string, planData: Partial<PlanFormData>): Promise<Plan> {
    const { data } = await api.patch<Plan>(`/plans/${id}`, planData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/plans/${id}`);
  },
};

export default plansService;
