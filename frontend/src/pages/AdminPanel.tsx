import { useState } from 'react';
import { Users, Settings, Database, Shield, Activity, AlertCircle } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');

  // Mock data
  const users = [
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active', lastLogin: '2 ساعت پیش' },
    { id: 2, username: 'analyst1', email: 'analyst1@example.com', role: 'analyst', status: 'active', lastLogin: '1 روز پیش' },
    { id: 3, username: 'viewer1', email: 'viewer1@example.com', role: 'viewer', status: 'inactive', lastLogin: '1 هفته پیش' },
  ];

  const thresholds = [
    { name: 'Fraud CFO Ratio', value: 1.0, category: 'تقلب' },
    { name: 'Receivable Growth', value: 1.2, category: 'تقلب' },
    { name: 'Asset Inflation', value: 0.15, category: 'تقلب' },
    { name: 'Accrual Ratio', value: 0.1, category: 'تقلب' },
    { name: 'Debt/Equity', value: 2.0, category: 'ریسک' },
    { name: 'Current Ratio', value: 1.5, category: 'ریسک' },
    { name: 'Quick Ratio', value: 1.0, category: 'ریسک' },
  ];

  const systemStats = [
    { label: 'تعداد کاربران', value: '3', icon: Users, color: 'blue' },
    { label: 'شرکت‌های ثبت شده', value: '3', icon: Database, color: 'green' },
    { label: 'تحلیل‌های انجام شده', value: '0', icon: Activity, color: 'purple' },
    { label: 'هشدارهای امنیتی', value: '0', icon: AlertCircle, color: 'red' },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'analyst':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      red: 'bg-red-50 border-red-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      red: 'text-red-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">پنل مدیریت</h1>
        <p className="text-gray-600 mt-1">مدیریت کاربران، تنظیمات و آستانه‌های سیستم</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {systemStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`rounded-lg p-5 border ${getStatColor(stat.color)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-8 h-8 ${getStatIconColor(stat.color)}`} />
                <span className={`text-2xl font-bold ${getStatIconColor(stat.color)}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-sm text-gray-700 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'users'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                مدیریت کاربران
              </div>
            </button>
            <button
              onClick={() => setActiveTab('thresholds')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'thresholds'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                آستانه‌های تشخیص
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'security'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                امنیت
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  لیست کاربران
                </h2>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
                  + افزودن کاربر
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">نام کاربری</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">ایمیل</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">نقش</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">وضعیت</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">آخرین ورود</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{user.id}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">{user.username}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{user.lastLogin}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              ویرایش
                            </button>
                            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Thresholds Tab */}
          {activeTab === 'thresholds' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  آستانه‌های تشخیص تقلب و ریسک
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  تنظیم محدوده‌های قابل قبول برای هر شاخص
                </p>
              </div>

              <div className="space-y-3">
                {thresholds.map((threshold, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{threshold.name}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {threshold.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        step="0.01"
                        value={threshold.value}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        ذخیره
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
                  ذخیره همه تغییرات
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                تنظیمات امنیتی
              </h2>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">احراز هویت دو مرحله‌ای</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        فعال‌سازی 2FA برای کاربران
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">مدت اعتبار توکن (ساعت)</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        مدت زمان اعتبار JWT Token
                      </p>
                    </div>
                    <input
                      type="number"
                      defaultValue={24}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">لاگ فعالیت‌ها</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        ثبت تمام فعالیت‌های کاربران
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
                  ذخیره تنظیمات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
