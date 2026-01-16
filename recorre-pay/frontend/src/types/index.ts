// Auth Types
export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
  isActive: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  defaultDueDay: number;
  reminderDaysBefore: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  tenant: Tenant;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessName: string;
  phone?: string;
}

// Customer Types
export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  document?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subscriptions?: Subscription[];
  payments?: Payment[];
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  document?: string;
  notes?: string;
}

// Plan Types
export interface Plan {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  intervalCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
}

export interface PlanFormData {
  name: string;
  description?: string;
  price: number;
  interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  intervalCount: number;
}

// Subscription Types
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'PAST_DUE';

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  dueDay: number;
  startDate: string;
  endDate?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  plan?: Plan;
}

export interface SubscriptionFormData {
  customerId: string;
  planId: string;
  dueDay: number;
}

// Payment Types
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED' | 'REFUNDED';

export interface Payment {
  id: string;
  subscriptionId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  subscription?: Subscription;
}

// Dashboard Types
export interface DashboardSummary {
  totalExpected: number;
  totalReceived: number;
  totalOverdue: number;
  activeCustomers: number;
  activeSubscriptions: number;
}

export interface OverduePayment {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface UpcomingPayment {
  id: string;
  customer: {
    id: string;
    name: string;
  };
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}

// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
