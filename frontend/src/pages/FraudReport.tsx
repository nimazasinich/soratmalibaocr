import { ShieldAlert, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

const FraudReport = () => {
  // Mock data - در آینده از API دریافت می‌شود
  const fraudIndicators = [
    {
      type: "Benford's Law",
      severity: 'Medium',
      score: 45,
      description: 'توزیع ارقام با قانون بنفورد مطابقت ندارد - احتمال دستکاری اعداد',
      recommendation: 'بررسی دقیق اعداد و منابع آن‌ها توصیه می‌شود',
    },
    {
      type: 'Quality of Earnings',
      severity: 'Low',
      score: 20,
      description: 'کیفیت سود خوب - جریان نقدی مناسب',
      recommendation: 'عملکرد خوب',
    },
    {
      type: 'Receivable Growth',
      severity: 'High',
      score: 65,
      description: 'رشد بالای حساب‌های دریافتنی نسبت به فروش',
      recommendation: 'بررسی سیاست اعتباری و کیفیت حساب‌های دریافتنی',
    },
    {
      type: 'Asset Inflation',
      severity: 'Low',
      score: 15,
      description: 'رشد دارایی‌های ثابت متناسب است',
      recommendation: 'عملکرد طبیعی',
    },
    {
      type: 'Accrual Ratio',
      severity: 'Medium',
      score: 35,
      description: 'نسبت تعهدی بالاتر از حد مطلوب',
      recommendation: 'بررسی دقیق اقلام تعهدی و سیاست‌های حسابداری',
    },
  ];

  const riskAssessments = [
    {
      type: 'Financial',
      level: 'Medium',
      score: 45,
      explanation: 'نسبت بدهی به حقوق صاحبان سهام متوسط - نیاز به نظارت',
      recommendation: 'کاهش بدهی و افزایش سرمایه',
    },
    {
      type: 'Liquidity',
      level: 'High',
      score: 70,
      explanation: 'نقدینگی پایین - احتمال مشکل در پرداخت بدهی‌های کوتاه‌مدت',
      recommendation: 'افزایش نقدینگی و کاهش بدهی‌های کوتاه‌مدت',
    },
    {
      type: 'Operational',
      level: 'Low',
      score: 15,
      explanation: 'هزینه‌های عملیاتی تحت کنترل - کارایی مناسب',
      recommendation: 'حفظ کارایی عملیاتی فعلی',
    },
    {
      type: 'Market',
      level: 'Medium',
      score: 45,
      description: 'تولید درآمد متوسط - حساسیت به تغییرات بازار',
      recommendation: 'افزایش بازاریابی و تنوع محصولات',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">گزارش تقلب و ریسک</h1>
        <p className="text-gray-600 mt-1">تحلیل جامع شاخص‌های تقلب و ارزیابی ریسک‌ها</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            <span className="text-3xl font-bold text-red-600">42</span>
          </div>
          <h3 className="text-sm font-medium text-red-900">امتیاز کلی تقلب</h3>
          <p className="text-xs text-red-700 mt-1">سطح ریسک: متوسط</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <span className="text-3xl font-bold text-orange-600">3</span>
          </div>
          <h3 className="text-sm font-medium text-orange-900">هشدارهای فعال</h3>
          <p className="text-xs text-orange-700 mt-1">نیاز به بررسی</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-600">2</span>
          </div>
          <h3 className="text-sm font-medium text-green-900">شاخص‌های سالم</h3>
          <p className="text-xs text-green-700 mt-1">وضعیت مطلوب</p>
        </div>
      </div>

      {/* Fraud Indicators */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          شاخص‌های تشخیص تقلب
        </h2>

        <div className="space-y-4">
          {fraudIndicators.map((indicator, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {indicator.type}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(indicator.severity)}`}
                    >
                      {indicator.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{indicator.description}</p>
                </div>
                <div className="text-left">
                  <div className={`text-2xl font-bold ${getScoreColor(indicator.score)}`}>
                    {indicator.score}
                  </div>
                  <div className="text-xs text-gray-500">امتیاز</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  توصیه: {indicator.recommendation}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessments */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          ارزیابی ریسک‌ها
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskAssessments.map((risk, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{risk.type}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(risk.level)}`}
                >
                  {risk.level}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">امتیاز ریسک:</span>
                  <span className={`font-bold ${getScoreColor(risk.score)}`}>
                    {risk.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      risk.score >= 70
                        ? 'bg-red-600'
                        : risk.score >= 50
                        ? 'bg-orange-600'
                        : risk.score >= 30
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${risk.score}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-2">{risk.explanation}</p>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-blue-600 font-medium">
                  📌 {risk.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
          دانلود گزارش PDF
        </button>
        <button className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
          ارسال به ایمیل
        </button>
      </div>
    </div>
  );
};

export default FraudReport;
