import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import PrivateRoute from './PrivateRoute';
import { ROUTES } from '../utils/constants';

// Auth Pages
import { Login, Register, ForgotPassword } from '../pages/auth';

// App Pages
import { Dashboard } from '../pages/dashboard';
import { CustomerList, CustomerForm, CustomerDetail } from '../pages/customers';
import { PlanList } from '../pages/plans';
import { SubscriptionList, SubscriptionForm } from '../pages/subscriptions';
import { PaymentList } from '../pages/payments';
import { Settings } from '../pages/settings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          {/* Dashboard */}
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

          {/* Customers */}
          <Route path={ROUTES.CUSTOMERS} element={<CustomerList />} />
          <Route path={ROUTES.CUSTOMER_NEW} element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />

          {/* Plans */}
          <Route path={ROUTES.PLANS} element={<PlanList />} />

          {/* Subscriptions */}
          <Route path={ROUTES.SUBSCRIPTIONS} element={<SubscriptionList />} />
          <Route path={ROUTES.SUBSCRIPTION_NEW} element={<SubscriptionForm />} />

          {/* Payments */}
          <Route path={ROUTES.PAYMENTS} element={<PaymentList />} />

          {/* Settings */}
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Route>
      </Route>

      {/* Redirect root to dashboard or login */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
