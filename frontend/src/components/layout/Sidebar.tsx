import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  FileText,
  TrendingUp,
  ShieldAlert,
  AlertTriangle,
  LineChart,
  ScanText,
  Settings,
  ChevronRight,
  X,
} from 'lucide-react';
import Badge from '../ui/Badge';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
      path: '/',
      badge: null,
    },
    {
      icon: Building2,
      label: t('nav.companies'),
      path: '/companies',
      badge: { text: '3', variant: 'primary' as const },
    },
    {
      icon: FileText,
      label: t('nav.statements'),
      path: '/statements',
      badge: null,
    },
    {
      icon: TrendingUp,
      label: t('nav.analysis'),
      path: '/analysis',
      badge: null,
    },
    {
      icon: ShieldAlert,
      label: t('nav.fraud'),
      path: '/fraud',
      badge: { text: '2', variant: 'danger' as const },
    },
    {
      icon: AlertTriangle,
      label: t('nav.risk'),
      path: '/risk',
      badge: { text: 'جدید', variant: 'warning' as const },
    },
    {
      icon: LineChart,
      label: t('nav.forecast'),
      path: '/forecast',
      badge: null,
    },
    {
      icon: ScanText,
      label: t('nav.ocr'),
      path: '/ocr',
      badge: null,
    },
  ];

  const adminItems = [
    {
      icon: Settings,
      label: t('nav.admin'),
      path: '/admin',
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 right-0 h-screen bg-white border-l border-gray-200 z-50 transition-all duration-300
          ${collapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">منو</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {/* Main Menu Items */}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                      ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge variant={item.badge.variant} size="sm">
                            {item.badge.text}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="pt-4 pb-2">
              <div className="border-t border-gray-200" />
            </div>

            {/* Admin Section */}
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  مدیریت
                </p>
              )}
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                      ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                    />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Collapse Toggle Button (Desktop Only) */}
          <div className="hidden lg:block p-4 border-t border-gray-200">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  collapsed ? 'rotate-0' : 'rotate-180'
                }`}
              />
              {!collapsed && <span>جمع کردن منو</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
