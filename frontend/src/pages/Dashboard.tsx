import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Building2,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Calendar,
  LineChart,
} from 'lucide-react';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'purple' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, trend, color }) => {
  const colorClasses = {
    blue: 'bg-primary-50 text-primary-600',
    green: 'bg-success-50 text-success-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-danger-50 text-danger-600',
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== 'neutral' && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
              trend === 'up'
                ? 'bg-success-50 text-success-700'
                : 'bg-danger-50 text-danger-700'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const dateRange = 'این ماه';

  const stats = [
    {
      icon: Building2,
      label: 'تعداد شرکت‌های فعال',
      value: '3',
      change: '+2',
      trend: 'up' as const,
      color: 'blue' as const,
    },
    {
      icon: FileText,
      label: 'صورت‌های مالی تحلیل شده',
      value: '0',
      change: '0',
      trend: 'neutral' as const,
      color: 'green' as const,
    },
    {
      icon: DollarSign,
      label: 'میانگین امتیاز مالی',
      value: '-',
      change: '-',
      trend: 'neutral' as const,
      color: 'purple' as const,
    },
    {
      icon: AlertTriangle,
      label: 'هشدارهای تقلب',
      value: '0',
      change: '0',
      trend: 'neutral' as const,
      color: 'red' as const,
    },
  ];

  // Sample data for recent analyses table
  const recentAnalyses = [
    {
      id: '1',
      company: 'شرکت ABC',
      type: 'ترازنامه',
      date: '1403/08/15',
      score: 85,
      status: 'completed',
      risk: 'low',
    },
    {
      id: '2',
      company: 'شرکت XYZ',
      type: 'صورت سود و زیان',
      date: '1403/08/14',
      score: 72,
      status: 'completed',
      risk: 'medium',
    },
    {
      id: '3',
      company: 'شرکت DEF',
      type: 'گردش وجوه نقد',
      date: '1403/08/13',
      score: 45,
      status: 'warning',
      risk: 'high',
    },
  ];

  const tableColumns = [
    {
      key: 'company',
      title: 'شرکت',
      sortable: true,
    },
    {
      key: 'type',
      title: 'نوع صورت مالی',
      sortable: false,
    },
    {
      key: 'date',
      title: 'تاریخ',
      sortable: true,
    },
    {
      key: 'score',
      title: 'امتیاز',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
            <div
              className={`h-2 rounded-full ${
                value >= 70 ? 'bg-success-500' : value >= 50 ? 'bg-warning-500' : 'bg-danger-500'
              }`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">{value}</span>
        </div>
      ),
    },
    {
      key: 'risk',
      title: 'سطح ریسک',
      sortable: false,
      render: (value: string) => {
        const riskConfig = {
          low: { label: 'پایین', variant: 'success' as const },
          medium: { label: 'متوسط', variant: 'warning' as const },
          high: { label: 'بالا', variant: 'danger' as const },
        };
        const config = riskConfig[value as keyof typeof riskConfig];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'status',
      title: 'وضعیت',
      sortable: false,
      render: (value: string) => {
        const statusConfig = {
          completed: { label: 'تکمیل شده', variant: 'success' as const, dot: true },
          warning: { label: 'نیاز به بررسی', variant: 'warning' as const, dot: true },
          pending: { label: 'در حال پردازش', variant: 'primary' as const, dot: true },
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        return (
          <Badge variant={config.variant} dot={config.dot}>
            {config.label}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600 mt-2">
            نمای کلی و تحلیل جامع وضعیت مالی شرکت‌ها
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" icon={<Calendar className="w-4 h-4" />}>
            {dateRange}
          </Button>
          <Button variant="ghost" icon={<Filter className="w-4 h-4" />}>
            فیلتر
          </Button>
          <Button variant="primary" icon={<Download className="w-4 h-4" />}>
            دانلود گزارش
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analyses - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="تحلیل‌های اخیر"
              subtitle="آخرین صورت‌های مالی پردازش شده"
              action={
                <Button variant="ghost" size="sm">
                  مشاهده همه
                </Button>
              }
            />
            <Table
              data={recentAnalyses}
              columns={tableColumns}
              emptyState={
                <div className="empty-state">
                  <FileText className="empty-state-icon" />
                  <h3 className="empty-state-title">هنوز تحلیلی انجام نشده است</h3>
                  <p className="empty-state-description">
                    برای شروع، یک صورت مالی جدید آپلود کنید
                  </p>
                  <Button variant="primary" className="mt-4">
                    آپلود صورت مالی
                  </Button>
                </div>
              }
            />
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader title="عملیات سریع" />
            <div className="space-y-3">
              <Button variant="primary" className="w-full justify-start">
                <FileText className="w-5 h-5 ml-2" />
                آپلود صورت مالی جدید
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="w-5 h-5 ml-2" />
                افزودن شرکت جدید
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-5 h-5 ml-2" />
                مشاهده تحلیل‌ها
              </Button>
            </div>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader
              title="هشدارهای مهم"
              action={<Badge variant="danger">2</Badge>}
            />
            <div className="space-y-3">
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-danger-900">
                      الگوی مشکوک شناسایی شد
                    </p>
                    <p className="text-xs text-danger-700 mt-1">
                      در تراکنش‌های شرکت DEF
                    </p>
                    <p className="text-xs text-danger-600 mt-2">
                      ۲ ساعت پیش
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warning-900">
                      نیاز به بررسی دستی
                    </p>
                    <p className="text-xs text-warning-700 mt-1">
                      صورت مالی شرکت XYZ
                    </p>
                    <p className="text-xs text-warning-600 mt-2">
                      ۵ ساعت پیش
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="sm" className="w-full">
                مشاهده همه هشدارها
              </Button>
            </div>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader title="وضعیت سیستم" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">OCR Engine</span>
                <div className="flex items-center gap-2">
                  <span className="status-dot status-dot-success" />
                  <span className="text-sm font-medium text-success-700">فعال</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Analysis</span>
                <div className="flex items-center gap-2">
                  <span className="status-dot status-dot-success" />
                  <span className="text-sm font-medium text-success-700">فعال</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center gap-2">
                  <span className="status-dot status-dot-success" />
                  <span className="text-sm font-medium text-success-700">متصل</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Section - Placeholder for future implementation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="روند تحلیل‌ها"
            subtitle="آمار ماهانه صورت‌های مالی پردازش شده"
          />
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">نمودار در حال توسعه</p>
              <p className="text-xs text-gray-500 mt-1">
                Chart.js یا Recharts به زودی اضافه می‌شود
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="توزیع سطح ریسک"
            subtitle="تحلیل ریسک شرکت‌ها"
          />
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">نمودار در حال توسعه</p>
              <p className="text-xs text-gray-500 mt-1">
                نمودار دایره‌ای یا میله‌ای به زودی
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
