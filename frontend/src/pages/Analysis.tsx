import { useState } from 'react';
import { Filter, TrendingUp, DollarSign, BarChart3, PieChart } from 'lucide-react';

const Analysis = () => {
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedYear, setSelectedYear] = useState('1402');
  const [selectedSector, setSelectedSector] = useState('all');

  // Mock data - در آینده از API می‌آید
  const companies = [
    { id: 1, name: 'شرکت نمونه الف' },
    { id: 2, name: 'شرکت نمونه ب' },
    { id: 3, name: 'شرکت نمونه ج' },
  ];

  const ratioData = [
    { name: 'نسبت جاری', value: 1.8, status: 'Good', ideal: 1.5, category: 'نقدینگی' },
    { name: 'نسبت آنی', value: 1.2, status: 'Good', ideal: 1.0, category: 'نقدینگی' },
    { name: 'نسبت بدهی', value: 0.45, status: 'Good', ideal: 0.5, category: 'اهرمی' },
    { name: 'حاشیه سود', value: 0.15, status: 'Good', ideal: 0.1, category: 'سودآوری' },
    { name: 'ROE', value: 0.18, status: 'Good', ideal: 0.15, category: 'سودآوری' },
    { name: 'ROA', value: 0.08, status: 'Warning', ideal: 0.1, category: 'سودآوری' },
    { name: 'گردش دارایی', value: 0.9, status: 'Warning', ideal: 1.0, category: 'کارایی' },
  ];

  const trendData = [
    { period: '1401-Q1', revenue: 2500000, netIncome: 300000 },
    { period: '1401-Q2', revenue: 2800000, netIncome: 350000 },
    { period: '1401-Q3', revenue: 3200000, netIncome: 420000 },
    { period: '1401-Q4', revenue: 3500000, netIncome: 480000 },
    { period: '1402-Q1', revenue: 3800000, netIncome: 520000 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'نقدینگی':
        return <DollarSign className="w-5 h-5 text-blue-600" />;
      case 'اهرمی':
        return <BarChart3 className="w-5 h-5 text-purple-600" />;
      case 'سودآوری':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'کارایی':
        return <PieChart className="w-5 h-5 text-orange-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">تحلیل تعاملی</h1>
        <p className="text-gray-600 mt-1">تحلیل و مقایسه نسبت‌های مالی با فیلترهای پیشرفته</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">فیلترها</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شرکت
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">همه شرکت‌ها</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سال مالی
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="1402">1402</option>
              <option value="1401">1401</option>
              <option value="1400">1400</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              بخش صنعت
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">همه بخش‌ها</option>
              <option value="manufacturing">تولیدی</option>
              <option value="service">خدماتی</option>
              <option value="commercial">تجاری</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
            اعمال فیلتر
          </button>
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">
            پاک کردن
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">1.5</span>
          </div>
          <p className="text-sm text-blue-700 font-medium">میانگین نقدینگی</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">15%</span>
          </div>
          <p className="text-sm text-green-700 font-medium">حاشیه سود</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">0.45</span>
          </div>
          <p className="text-sm text-purple-700 font-medium">نسبت بدهی</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <PieChart className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">0.9</span>
          </div>
          <p className="text-sm text-orange-700 font-medium">گردش دارایی</p>
        </div>
      </div>

      {/* Financial Ratios Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          نسبت‌های مالی
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-gray-700">دسته‌بندی</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">نسبت</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">مقدار</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">ایده‌آل</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">وضعیت</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">مقایسه</th>
              </tr>
            </thead>
            <tbody>
              {ratioData.map((ratio, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(ratio.category)}
                      <span className="text-sm text-gray-600">{ratio.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{ratio.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900 font-semibold">
                      {ratio.value.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">{ratio.ideal.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ratio.status)}`}>
                      {ratio.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          ratio.value >= ratio.ideal
                            ? 'bg-green-600'
                            : ratio.value >= ratio.ideal * 0.8
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min((ratio.value / ratio.ideal) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend Chart Placeholder */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          روند درآمد و سود
        </h2>

        <div className="space-y-4">
          {trendData.map((data, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-700">
                {data.period}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-600">درآمد:</span>
                  <div className="flex-1 bg-blue-100 rounded-full h-6 relative">
                    <div
                      className="bg-blue-600 h-6 rounded-full flex items-center justify-end px-2"
                      style={{ width: `${(data.revenue / 4000000) * 100}%` }}
                    >
                      <span className="text-xs text-white font-semibold">
                        {(data.revenue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">سود:</span>
                  <div className="flex-1 bg-green-100 rounded-full h-6 relative">
                    <div
                      className="bg-green-600 h-6 rounded-full flex items-center justify-end px-2"
                      style={{ width: `${(data.netIncome / 600000) * 100}%` }}
                    >
                      <span className="text-xs text-white font-semibold">
                        {(data.netIncome / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
          دانلود گزارش Excel
        </button>
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
          دانلود نمودار PDF
        </button>
        <button className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition">
          اشتراک‌گذاری
        </button>
      </div>
    </div>
  );
};

export default Analysis;
