import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Building2,
  FileText,
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Building2,
      label: 'تعداد شرکت‌ها',
      value: '3',
      change: '+2',
      trend: 'up',
      color: 'blue',
    },
    {
      icon: FileText,
      label: 'صورت‌های مالی',
      value: '0',
      change: '0',
      trend: 'neutral',
      color: 'green',
    },
    {
      icon: DollarSign,
      label: 'میانگین امتیاز مالی',
      value: '-',
      change: '-',
      trend: 'neutral',
      color: 'purple',
    },
    {
      icon: AlertTriangle,
      label: 'هشدارهای تقلب',
      value: '0',
      change: '0',
      trend: 'neutral',
      color: 'red',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-1">نمای کلی وضعیت مالی شرکت‌ها</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            red: 'bg-red-50 text-red-600',
          };

          return (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </div>
                )}
                {stat.trend === 'down' && (
                  <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                    <TrendingDown className="w-4 h-4" />
                    {stat.change}
                  </div>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-l from-primary-500 to-primary-700 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">به سیستم CloudCoder خوش آمدید! 🎉</h2>
        <p className="text-primary-50 mb-6">
          سیستم هوشمند تحلیل صورت‌های مالی و تشخیص تقلب با قابلیت OCR فارسی
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition">
            شروع تحلیل جدید
          </button>
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-500 transition border border-primary-400">
            آپلود صورت مالی
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            تحلیل‌های اخیر
          </h3>
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>هنوز تحلیلی انجام نشده است</p>
            <p className="text-sm mt-1">لطفاً یک صورت مالی آپلود کنید</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            هشدارهای مهم
          </h3>
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>هیچ هشداری وجود ندارد</p>
            <p className="text-sm mt-1">همه چیز روبراه است ✅</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
