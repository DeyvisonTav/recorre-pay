export const APP_NAME = 'RecorrePay';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/customers',
  CUSTOMER_NEW: '/customers/new',
  CUSTOMER_DETAIL: '/customers/:id',
  CUSTOMER_EDIT: '/customers/:id/edit',
  PLANS: '/plans',
  PLAN_NEW: '/plans/new',
  PLAN_EDIT: '/plans/:id/edit',
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTION_NEW: '/subscriptions/new',
  PAYMENTS: '/payments',
  SETTINGS: '/settings',
} as const;

export const STATUS_COLORS = {
  // Subscription status
  ACTIVE: 'success',
  PAUSED: 'warning',
  CANCELED: 'danger',
  PAST_DUE: 'danger',
  // Payment status
  PENDING: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  REFUNDED: 'default',
} as const;

export const BILLING_INTERVALS = [
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'YEARLY', label: 'Anual' },
] as const;

export const DUE_DAYS = Array.from({ length: 28 }, (_, i) => ({
  value: i + 1,
  label: `Dia ${i + 1}`,
}));
