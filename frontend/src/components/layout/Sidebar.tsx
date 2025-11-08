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
} from 'lucide-react';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/' },
    { icon: Building2, label: t('nav.companies'), path: '/companies' },
    { icon: FileText, label: t('nav.statements'), path: '/statements' },
    { icon: TrendingUp, label: t('nav.analysis'), path: '/analysis' },
    { icon: ShieldAlert, label: t('nav.fraud'), path: '/fraud' },
    { icon: AlertTriangle, label: t('nav.risk'), path: '/risk' },
    { icon: LineChart, label: t('nav.forecast'), path: '/forecast' },
    { icon: ScanText, label: t('nav.ocr'), path: '/ocr' },
    { icon: Settings, label: t('nav.admin'), path: '/admin' },
  ];

  return (
    <aside className="w-64 bg-white border-l border-gray-200 min-h-screen">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
