import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
