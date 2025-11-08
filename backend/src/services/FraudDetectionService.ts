import { FinancialStatement } from '../repositories/FinancialStatementRepository';

export interface FraudIndicator {
  flagType: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number; // 0-100
  description: string;
  details: any;
  recommendation: string;
}

export interface FraudAnalysisResult {
  statementId: number;
  overallFraudScore: number; // 0-100 (0 = no fraud, 100 = high fraud)
  indicators: FraudIndicator[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export class FraudDetectionService {
  /**
   * Run complete fraud analysis on a financial statement
   */
  static async analyzeStatement(
    statement: FinancialStatement,
    previousStatements?: FinancialStatement[]
  ): Promise<FraudAnalysisResult> {
    const indicators: FraudIndicator[] = [];

    // 1. Benford's Law Analysis
    indicators.push(this.benfordLawAnalysis(statement));

    // 2. Quality of Earnings
    indicators.push(this.qualityOfEarnings(statement));

    // 3. Receivable Growth Analysis
    if (previousStatements && previousStatements.length > 0) {
      indicators.push(this.receivableGrowthAnalysis(statement, previousStatements[0]));
    }

    // 4. Asset Inflation Analysis
    if (previousStatements && previousStatements.length > 0) {
      indicators.push(this.assetInflationAnalysis(statement, previousStatements[0]));
    }

    // 5. Accrual Ratio
    indicators.push(this.accrualRatio(statement));

    // Calculate overall fraud score
    const overallFraudScore = this.calculateOverallFraudScore(indicators);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallFraudScore);

    return {
      statementId: statement.id!,
      overallFraudScore,
      indicators: indicators.filter((i) => i.score > 0), // Only return flagged indicators
      riskLevel,
    };
  }

  /**
   * 1. Benford's Law Analysis
   * Analyzes the distribution of first digits in financial numbers
   */
  private static benfordLawAnalysis(statement: FinancialStatement): FraudIndicator {
    // Extract all non-zero numbers from statement
    const numbers: number[] = [];

    const fields = [
      statement.assets,
      statement.liabilities,
      statement.current_assets,
      statement.current_liabilities,
      statement.revenue,
      statement.net_income,
      statement.cash,
      statement.inventory,
      statement.accounts_receivable,
    ];

    fields.forEach((num) => {
      if (num && num > 0) {
        numbers.push(num);
      }
    });

    if (numbers.length < 5) {
      return {
        flagType: "Benford's Law",
        severity: 'Low',
        score: 0,
        description: 'تعداد داده کافی برای تحلیل قانون بنفورد وجود ندارد',
        details: { sampleSize: numbers.length },
        recommendation: 'نیاز به داده‌های بیشتر',
      };
    }

    // Expected Benford distribution for first digit
    const benfordExpected = [0, 30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];

    // Count first digits
    const firstDigitCounts = new Array(10).fill(0);

    numbers.forEach((num) => {
      const firstDigit = parseInt(String(Math.abs(num))[0]);
      if (firstDigit >= 1 && firstDigit <= 9) {
        firstDigitCounts[firstDigit]++;
      }
    });

    // Calculate actual distribution
    const total = numbers.length;
    const actualDistribution = firstDigitCounts.map((count) => (count / total) * 100);

    // Chi-square test
    let chiSquare = 0;
    for (let i = 1; i <= 9; i++) {
      const expected = (benfordExpected[i] / 100) * total;
      const observed = firstDigitCounts[i];
      if (expected > 0) {
        chiSquare += Math.pow(observed - expected, 2) / expected;
      }
    }

    // Chi-square critical value at 95% confidence for 8 degrees of freedom is ~15.51
    const criticalValue = 15.51;
    const deviation = chiSquare > criticalValue;

    let score = 0;
    let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';

    if (chiSquare > criticalValue * 2) {
      score = 80;
      severity = 'Critical';
    } else if (chiSquare > criticalValue * 1.5) {
      score = 60;
      severity = 'High';
    } else if (chiSquare > criticalValue) {
      score = 40;
      severity = 'Medium';
    }

    return {
      flagType: "Benford's Law",
      severity,
      score,
      description: deviation
        ? 'توزیع ارقام با قانون بنفورد مطابقت ندارد - احتمال دستکاری اعداد'
        : 'توزیع ارقام طبیعی است',
      details: {
        chiSquare,
        criticalValue,
        actualDistribution,
        benfordExpected,
      },
      recommendation: deviation
        ? 'بررسی دقیق اعداد و منابع آن‌ها توصیه می‌شود'
        : 'مشکلی مشاهده نشد',
    };
  }

  /**
   * 2. Quality of Earnings
   * Compares Operating Cash Flow to Net Income
   * Formula: CFO / Net Income < 1 is a red flag
   */
  private static qualityOfEarnings(statement: FinancialStatement): FraudIndicator {
    if (!statement.operating_cf || !statement.net_income || statement.net_income === 0) {
      return {
        flagType: 'Quality of Earnings',
        severity: 'Low',
        score: 0,
        description: 'داده‌های کافی برای تحلیل کیفیت سود وجود ندارد',
        details: {},
        recommendation: 'نیاز به داده‌های جریان نقدی و سود خالص',
      };
    }

    const ratio = statement.operating_cf / statement.net_income;

    let score = 0;
    let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let description = '';

    if (ratio < 0.5) {
      score = 90;
      severity = 'Critical';
      description = 'کیفیت سود بسیار پایین - جریان نقدی عملیاتی کمتر از 50% سود';
    } else if (ratio < 0.8) {
      score = 60;
      severity = 'High';
      description = 'کیفیت سود پایین - جریان نقدی ضعیف نسبت به سود گزارش شده';
    } else if (ratio < 1.0) {
      score = 30;
      severity = 'Medium';
      description = 'کیفیت سود متوسط - جریان نقدی کمتر از سود';
    } else {
      description = 'کیفیت سود خوب - جریان نقدی مناسب';
    }

    return {
      flagType: 'Quality of Earnings',
      severity,
      score,
      description,
      details: {
        ratio,
        operating_cf: statement.operating_cf,
        net_income: statement.net_income,
        threshold: 1.0,
      },
      recommendation:
        score > 0
          ? 'بررسی دقیق منابع سود و علت عدم تبدیل به جریان نقدی'
          : 'عملکرد خوب',
    };
  }

  /**
   * 3. Receivable Growth Analysis
   * Formula: (ΔAR% / ΔSales%) > 1.2 is a red flag
   */
  private static receivableGrowthAnalysis(
    current: FinancialStatement,
    previous: FinancialStatement
  ): FraudIndicator {
    if (
      !current.accounts_receivable ||
      !previous.accounts_receivable ||
      !current.revenue ||
      !previous.revenue
    ) {
      return {
        flagType: 'Receivable Growth',
        severity: 'Low',
        score: 0,
        description: 'داده کافی برای تحلیل رشد حساب‌های دریافتنی وجود ندارد',
        details: {},
        recommendation: 'نیاز به داده‌های حساب‌های دریافتنی و فروش',
      };
    }

    const arGrowth =
      (current.accounts_receivable - previous.accounts_receivable) / previous.accounts_receivable;
    const salesGrowth = (current.revenue - previous.revenue) / previous.revenue;

    // Avoid division by zero
    if (salesGrowth === 0) {
      return {
        flagType: 'Receivable Growth',
        severity: 'Low',
        score: 0,
        description: 'رشد فروش صفر است',
        details: { arGrowth, salesGrowth },
        recommendation: 'بررسی علت عدم رشد فروش',
      };
    }

    const ratio = arGrowth / salesGrowth;

    let score = 0;
    let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let description = '';

    if (ratio > 2.0) {
      score = 85;
      severity = 'Critical';
      description = 'رشد غیرعادی حساب‌های دریافتنی - احتمال تقلب در شناسایی درآمد';
    } else if (ratio > 1.5) {
      score = 65;
      severity = 'High';
      description = 'رشد بالای حساب‌های دریافتنی نسبت به فروش';
    } else if (ratio > 1.2) {
      score = 40;
      severity = 'Medium';
      description = 'رشد حساب‌های دریافتنی بیش از فروش';
    } else {
      description = 'رشد حساب‌های دریافتنی متناسب با فروش';
    }

    return {
      flagType: 'Receivable Growth',
      severity,
      score,
      description,
      details: {
        ratio,
        arGrowth: (arGrowth * 100).toFixed(2) + '%',
        salesGrowth: (salesGrowth * 100).toFixed(2) + '%',
        threshold: 1.2,
      },
      recommendation:
        score > 0
          ? 'بررسی سیاست اعتباری و کیفیت حساب‌های دریافتنی'
          : 'عملکرد طبیعی',
    };
  }

  /**
   * 4. Asset Inflation Analysis
   * Formula: ΔFA% > ΔRevenue% + 0.15 is a warning
   */
  private static assetInflationAnalysis(
    current: FinancialStatement,
    previous: FinancialStatement
  ): FraudIndicator {
    if (
      !current.fixed_assets ||
      !previous.fixed_assets ||
      !current.revenue ||
      !previous.revenue
    ) {
      return {
        flagType: 'Asset Inflation',
        severity: 'Low',
        score: 0,
        description: 'داده کافی برای تحلیل تورم دارایی وجود ندارد',
        details: {},
        recommendation: 'نیاز به داده‌های دارایی‌های ثابت',
      };
    }

    const faGrowth = (current.fixed_assets - previous.fixed_assets) / previous.fixed_assets;
    const revenueGrowth = (current.revenue - previous.revenue) / previous.revenue;

    const difference = faGrowth - revenueGrowth;

    let score = 0;
    let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let description = '';

    if (difference > 0.30) {
      score = 75;
      severity = 'Critical';
      description = 'افزایش غیرعادی دارایی‌های ثابت - احتمال تورم مصنوعی دارایی';
    } else if (difference > 0.20) {
      score = 55;
      severity = 'High';
      description = 'افزایش بالای دارایی‌های ثابت نسبت به درآمد';
    } else if (difference > 0.15) {
      score = 35;
      severity = 'Medium';
      description = 'افزایش دارایی‌های ثابت بیش از حد انتظار';
    } else {
      description = 'رشد دارایی‌های ثابت متناسب است';
    }

    return {
      flagType: 'Asset Inflation',
      severity,
      score,
      description,
      details: {
        faGrowth: (faGrowth * 100).toFixed(2) + '%',
        revenueGrowth: (revenueGrowth * 100).toFixed(2) + '%',
        difference: (difference * 100).toFixed(2) + '%',
        threshold: '15%',
      },
      recommendation:
        score > 0
          ? 'بررسی ارزش‌گذاری دارایی‌های ثابت و استهلاک'
          : 'عملکرد طبیعی',
    };
  }

  /**
   * 5. Accrual Ratio
   * Formula: (Net Income - CFO) / Total Assets > 0.1 is a red flag
   */
  private static accrualRatio(statement: FinancialStatement): FraudIndicator {
    if (!statement.net_income || !statement.operating_cf || !statement.assets) {
      return {
        flagType: 'Accrual Ratio',
        severity: 'Low',
        score: 0,
        description: 'داده کافی برای محاسبه نسبت تعهدی وجود ندارد',
        details: {},
        recommendation: 'نیاز به داده‌های سود، جریان نقدی و دارایی',
      };
    }

    const accrual = (statement.net_income - statement.operating_cf) / statement.assets;

    let score = 0;
    let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let description = '';

    if (Math.abs(accrual) > 0.15) {
      score = 80;
      severity = 'Critical';
      description = 'نسبت تعهدی بسیار بالا - احتمال قوی دستکاری سود';
    } else if (Math.abs(accrual) > 0.12) {
      score = 60;
      severity = 'High';
      description = 'نسبت تعهدی بالا - احتمال دستکاری سود';
    } else if (Math.abs(accrual) > 0.10) {
      score = 35;
      severity = 'Medium';
      description = 'نسبت تعهدی بالاتر از حد مطلوب';
    } else {
      description = 'نسبت تعهدی در محدوده طبیعی';
    }

    return {
      flagType: 'Accrual Ratio',
      severity,
      score,
      description,
      details: {
        accrualRatio: accrual.toFixed(4),
        net_income: statement.net_income,
        operating_cf: statement.operating_cf,
        total_assets: statement.assets,
        threshold: 0.1,
      },
      recommendation:
        score > 0
          ? 'بررسی دقیق اقلام تعهدی و سیاست‌های حسابداری'
          : 'عملکرد طبیعی',
    };
  }

  /**
   * Calculate overall fraud score from all indicators
   */
  private static calculateOverallFraudScore(indicators: FraudIndicator[]): number {
    if (indicators.length === 0) return 0;

    // Weighted average of fraud scores
    const totalScore = indicators.reduce((sum, indicator) => sum + indicator.score, 0);

    return Math.min(100, totalScore / indicators.length);
  }

  /**
   * Determine risk level based on overall fraud score
   */
  private static determineRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (score >= 70) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  }
}

export default FraudDetectionService;
