import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Package,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES, APP_NAME } from '../../utils/constants';

const navItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.CUSTOMERS, label: 'Clientes', icon: Users },
  { path: ROUTES.PLANS, label: 'Planos', icon: Package },
  { path: ROUTES.SUBSCRIPTIONS, label: 'Assinaturas', icon: CreditCard },
  { path: ROUTES.PAYMENTS, label: 'Pagamentos', icon: Receipt },
];

export default function Sidebar() {
  const { logout, tenant } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">{APP_NAME}</h1>
      </div>

      {/* Tenant Info */}
      {tenant && (
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900 truncate">{tenant.name}</p>
          <p className="text-xs text-gray-500 truncate">{tenant.email}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <NavLink
          to={ROUTES.SETTINGS}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          Configurações
        </NavLink>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
