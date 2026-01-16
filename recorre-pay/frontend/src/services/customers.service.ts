import api from './api';
import { Customer, CustomerFormData, PaginatedResponse, Payment } from '../types';

interface CustomerFilters {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: boolean;
}

export const customersService = {
  async getAll(filters: CustomerFilters = {}): Promise<PaginatedResponse<Customer>> {
    const { data } = await api.get<PaginatedResponse<Customer>>('/customers', {
      params: filters,
    });
    return data;
  },

  async getById(id: string): Promise<Customer> {
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  async create(customerData: CustomerFormData): Promise<Customer> {
    const { data } = await api.post<Customer>('/customers', customerData);
    return data;
  },

  async update(id: string, customerData: Partial<CustomerFormData>): Promise<Customer> {
    const { data } = await api.patch<Customer>(`/customers/${id}`, customerData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async getPayments(id: string): Promise<Payment[]> {
    const { data } = await api.get<Payment[]>(`/customers/${id}/payments`);
    return data;
  },
};

export default customersService;
