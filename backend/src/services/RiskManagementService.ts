import { FinancialStatement } from '../repositories/FinancialStatementRepository';

export interface RiskAssessment {
  riskType: 'Financial' | 'Liquidity' | 'Operational' | 'Market';
  score: number; // 0-100 (0 = no risk, 100 = critical risk)
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  explanation: string;
  recommendation: string;
  metrics: any;
}

export interface ComprehensiveRiskReport {
  statementId: number;
  overallRiskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  assessments: RiskAssessment[];
  summary: string;
}

/**
 * Risk Management Service
 * Evaluates various risk categories for financial statements
 */
export class RiskManagementService {
  /**
   * Perform comprehensive risk assessment
   */
  static assessRisks(statement: FinancialStatement): ComprehensiveRiskReport {
    const assessments: RiskAssessment[] = [];

    // 1. Financial Risk (Solvency)
    assessments.push(this.assessFinancialRisk(statement));

    // 2. Liquidity Risk
    assessments.push(this.assessLiquidityRisk(statement));

    // 3. Operational Risk
    assessments.push(this.assessOperationalRisk(statement));

    // 4. Market Risk (if revenue data available)
    if (statement.revenue) {
      assessments.push(this.assessMarketRisk(statement));
    }

    // Calculate overall risk score
    const overallRiskScore = this.calculateOverallRisk(assessments);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallRiskScore);

    // Generate summary
    const summary = this.generateSummary(assessments, overallRiskScore, riskLevel);

    return {
      statementId: statement.id!,
      overallRiskScore,
      riskLevel,
      assessments,
      summary,
    };
  }

  /**
   * 1. Financial Risk Assessment (Solvency)
   * Based on Debt/Equity ratio
   */
  private static assessFinancialRisk(statement: FinancialStatement): RiskAssessment {
    const equity = statement.equity || statement.assets - statement.liabilities;
    const debtToEquity = equity > 0 ? statement.liabilities / equity : Infinity;

    let score = 0;
    let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let explanation = '';

    if (debtToEquity > 5.0) {
      score = 95;
      level = 'Critical';
      explanation = 'نسبت بدهی به حقوق صاحبان سهام بسیار بالا - ریسک ورشکستگی شدید';
    } else if (debtToEquity > 3.0) {
      score = 75;
      level = 'High';
      explanation = 'نسبت بدهی به حقوق صاحبان سهام بالا - ریسک مالی قابل توجه';
    } else if (debtToEquity > 2.0) {
      score = 45;
      level = 'Medium';
      explanation = 'نسبت بدهی به حقوق صاحبان سهام متوسط - نیاز به نظارت';
    } else {
      score = 15;
      level = 'Low';
      explanation = 'نسبت بدهی به حقوق صاحبان سهام مناسب - ریسک مالی پایین';
    }

    return {
      riskType: 'Financial',
      score,
      level,
      explanation,
      recommendation:
        level === 'Low'
          ? 'حفظ ساختار سرمایه فعلی'
          : 'کاهش بدهی و افزایش سرمایه',
      metrics: {
        debtToEquity,
        totalLiabilities: statement.liabilities,
        equity,
        threshold: 2.0,
      },
    };
  }

  /**
   * 2. Liquidity Risk Assessment
   * Based on Cash Flow / Current Liabilities
   */
  private static assessLiquidityRisk(statement: FinancialStatement): RiskAssessment {
    if (!statement.current_liabilities || statement.current_liabilities === 0) {
      return {
        riskType: 'Liquidity',
        score: 0,
        level: 'Low',
        explanation: 'داده کافی برای ارزیابی ریسک نقدینگی وجود ندارد',
        recommendation: 'جمع‌آوری داده‌های بدهی‌های جاری',
        metrics: {},
      };
    }

    const cash = statement.cash || 0;
    const currentAssets = statement.current_assets || 0;
    const currentLiabilities = statement.current_liabilities;

    const cashRatio = cash / currentLiabilities;
    const currentRatio = currentAssets / currentLiabilities;

    let score = 0;
    let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let explanation = '';

    if (currentRatio < 0.8) {
      score = 90;
      level = 'Critical';
      explanation = 'نقدینگی بسیار پایین - خطر جدی عدم توانایی پرداخت بدهی‌ها';
    } else if (currentRatio < 1.0) {
      score = 70;
      level = 'High';
      explanation = 'نقدینگی پایین - احتمال مشکل در پرداخت بدهی‌های کوتاه‌مدت';
    } else if (currentRatio < 1.5) {
      score = 40;
      level = 'Medium';
      explanation = 'نقدینگی متوسط - نیاز به بهبود';
    } else {
      score = 15;
      level = 'Low';
      explanation = 'نقدینگی مناسب - توانایی پرداخت بدهی‌ها';
    }

    return {
      riskType: 'Liquidity',
      score,
      level,
      explanation,
      recommendation:
        level === 'Low'
          ? 'حفظ سطح نقدینگی فعلی'
          : 'افزایش نقدینگی و کاهش بدهی‌های کوتاه‌مدت',
      metrics: {
        currentRatio,
        cashRatio,
        cash,
        currentAssets,
        currentLiabilities,
        threshold: 1.5,
      },
    };
  }

  /**
   * 3. Operational Risk Assessment
   * Based on Operating Expense / Revenue ratio
   */
  private static assessOperationalRisk(statement: FinancialStatement): RiskAssessment {
    if (!statement.revenue || statement.revenue === 0 || !statement.operating_expenses) {
      return {
        riskType: 'Operational',
        score: 0,
        level: 'Low',
        explanation: 'داده کافی برای ارزیابی ریسک عملیاتی وجود ندارد',
        recommendation: 'جمع‌آوری داده‌های هزینه‌های عملیاتی',
        metrics: {},
      };
    }

    const opexRatio = statement.operating_expenses / statement.revenue;
    const operatingMargin = statement.ebit ? statement.ebit / statement.revenue : 0;

    let score = 0;
    let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let explanation = '';

    if (opexRatio > 0.9) {
      score = 85;
      level = 'Critical';
      explanation = 'هزینه‌های عملیاتی بسیار بالا - حاشیه سود عملیاتی منفی یا بسیار پایین';
    } else if (opexRatio > 0.75) {
      score = 65;
      level = 'High';
      explanation = 'هزینه‌های عملیاتی بالا - کارایی عملیاتی پایین';
    } else if (opexRatio > 0.60) {
      score = 40;
      level = 'Medium';
      explanation = 'هزینه‌های عملیاتی متوسط - نیاز به بهینه‌سازی';
    } else {
      score = 15;
      level = 'Low';
      explanation = 'هزینه‌های عملیاتی تحت کنترل - کارایی مناسب';
    }

    return {
      riskType: 'Operational',
      score,
      level,
      explanation,
      recommendation:
        level === 'Low'
          ? 'حفظ کارایی عملیاتی فعلی'
          : 'کاهش هزینه‌ها و بهبود فرآیندهای عملیاتی',
      metrics: {
        opexRatio,
        operatingMargin,
        operating_expenses: statement.operating_expenses,
        revenue: statement.revenue,
        threshold: 0.6,
      },
    };
  }

  /**
   * 4. Market Risk Assessment
   * Based on revenue volatility and trends
   */
  private static assessMarketRisk(statement: FinancialStatement): RiskAssessment {
    // This is a simplified assessment
    // In a real scenario, we would analyze revenue trends over time

    const revenueToAssets = statement.revenue! / statement.assets;
    const profitability = statement.net_income
      ? statement.net_income / statement.revenue!
      : 0;

    let score = 0;
    let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let explanation = '';

    // Low revenue generation relative to assets indicates market risk
    if (revenueToAssets < 0.3) {
      score = 70;
      level = 'High';
      explanation = 'تولید درآمد پایین نسبت به دارایی‌ها - ریسک بازار بالا';
    } else if (revenueToAssets < 0.5) {
      score = 45;
      level = 'Medium';
      explanation = 'تولید درآمد متوسط - حساسیت به تغییرات بازار';
    } else {
      score = 20;
      level = 'Low';
      explanation = 'تولید درآمد مناسب - ریسک بازار قابل قبول';
    }

    // Adjust based on profitability
    if (profitability < 0) {
      score += 20;
      level = score >= 70 ? 'Critical' : score >= 50 ? 'High' : 'Medium';
    }

    return {
      riskType: 'Market',
      score: Math.min(100, score),
      level,
      explanation,
      recommendation:
        level === 'Low'
          ? 'حفظ سهم بازار و تنوع‌بخشی'
          : 'افزایش بازاریابی و تنوع محصولات',
      metrics: {
        revenueToAssets,
        profitability,
        revenue: statement.revenue,
        assets: statement.assets,
      },
    };
  }

  /**
   * Calculate overall risk score
   */
  private static calculateOverallRisk(assessments: RiskAssessment[]): number {
    if (assessments.length === 0) return 0;

    // Weighted average
    const weights = {
      Financial: 0.3,
      Liquidity: 0.3,
      Operational: 0.25,
      Market: 0.15,
    };

    let totalScore = 0;
    let totalWeight = 0;

    assessments.forEach((assessment) => {
      const weight = weights[assessment.riskType] || 0.25;
      totalScore += assessment.score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Determine overall risk level
   */
  private static determineRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (score >= 70) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  }

  /**
   * Generate summary in Persian
   */
  private static generateSummary(
    assessments: RiskAssessment[],
    overallScore: number,
    riskLevel: string
  ): string {
    const lines: string[] = [];

    lines.push(`📊 ارزیابی جامع ریسک: سطح ${riskLevel} (امتیاز: ${overallScore.toFixed(1)})`);
    lines.push('');

    assessments.forEach((assessment) => {
      const icon =
        assessment.level === 'Critical'
          ? '🔴'
          : assessment.level === 'High'
          ? '🟠'
          : assessment.level === 'Medium'
          ? '🟡'
          : '🟢';

      lines.push(`${icon} ${assessment.riskType}: ${assessment.explanation}`);
    });

    return lines.join('\n');
  }
}

export default RiskManagementService;
