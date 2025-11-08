import { FinancialStatement } from '../repositories/FinancialStatementRepository';

export interface ZScoreResult {
  zScore: number;
  zone: 'Safe' | 'Grey' | 'Distress';
  bankruptcyRisk: 'Low' | 'Medium' | 'High';
  explanation: string;
  components: {
    workingCapitalRatio: number;
    retainedEarningsRatio: number;
    ebitRatio: number;
    marketValueRatio: number;
    salesRatio: number;
  };
}

export interface RevenueForecast {
  period: string;
  predictedRevenue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  growthRate: number;
  methodology: string;
}

/**
 * Forecasting Service
 * Implements Altman Z-Score and revenue forecasting
 */
export class ForecastingService {
  /**
   * Calculate Altman Z-Score for Bankruptcy Prediction
   *
   * Formula (for private companies):
   * Z = 1.2*WC/TA + 1.4*RE/TA + 3.3*EBIT/TA + 0.6*MVE/TL + 1.0*Sales/TA
   *
   * Where:
   * WC = Working Capital (Current Assets - Current Liabilities)
   * TA = Total Assets
   * RE = Retained Earnings
   * EBIT = Earnings Before Interest and Tax
   * MVE = Market Value of Equity (approximated by book value for private companies)
   * TL = Total Liabilities
   * Sales = Revenue
   *
   * Interpretation:
   * Z > 2.99 = Safe Zone (low bankruptcy risk)
   * 1.81 < Z < 2.99 = Grey Zone (moderate risk)
   * Z < 1.81 = Distress Zone (high bankruptcy risk)
   */
  static calculateZScore(statement: FinancialStatement): ZScoreResult {
    const totalAssets = statement.assets;
    const totalLiabilities = statement.liabilities;
    const equity = statement.equity || totalAssets - totalLiabilities;

    // Component 1: Working Capital / Total Assets
    const workingCapital =
      (statement.current_assets || 0) - (statement.current_liabilities || 0);
    const wc_ta = workingCapital / totalAssets;

    // Component 2: Retained Earnings / Total Assets
    const retainedEarnings = statement.retained_earnings || statement.net_income || 0;
    const re_ta = retainedEarnings / totalAssets;

    // Component 3: EBIT / Total Assets
    const ebit = statement.ebit || statement.net_income || 0;
    const ebit_ta = ebit / totalAssets;

    // Component 4: Market Value of Equity / Total Liabilities
    // For private companies, use book value of equity
    const mve_tl = totalLiabilities > 0 ? equity / totalLiabilities : 0;

    // Component 5: Sales / Total Assets
    const sales = statement.revenue || 0;
    const sales_ta = sales / totalAssets;

    // Calculate Z-Score
    const zScore =
      1.2 * wc_ta + 1.4 * re_ta + 3.3 * ebit_ta + 0.6 * mve_tl + 1.0 * sales_ta;

    // Determine zone and risk
    let zone: 'Safe' | 'Grey' | 'Distress';
    let bankruptcyRisk: 'Low' | 'Medium' | 'High';
    let explanation: string;

    if (zScore > 2.99) {
      zone = 'Safe';
      bankruptcyRisk = 'Low';
      explanation = 'شرکت در منطقه امن قرار دارد. احتمال ورشکستگی پایین است.';
    } else if (zScore > 1.81) {
      zone = 'Grey';
      bankruptcyRisk = 'Medium';
      explanation =
        'شرکت در منطقه خاکستری قرار دارد. نیاز به نظارت دقیق و بهبود عملکرد مالی.';
    } else {
      zone = 'Distress';
      bankruptcyRisk = 'High';
      explanation =
        '🚨 شرکت در منطقه خطر قرار دارد. احتمال ورشکستگی بالا - نیاز فوری به اقدامات اصلاحی.';
    }

    return {
      zScore: Math.round(zScore * 100) / 100,
      zone,
      bankruptcyRisk,
      explanation,
      components: {
        workingCapitalRatio: wc_ta,
        retainedEarningsRatio: re_ta,
        ebitRatio: ebit_ta,
        marketValueRatio: mve_tl,
        salesRatio: sales_ta,
      },
    };
  }

  /**
   * Forecast future revenue based on historical trend
   */
  static forecastRevenue(
    statements: FinancialStatement[],
    periodsAhead: number = 1
  ): RevenueForecast[] {
    if (statements.length < 2) {
      throw new Error('حداقل 2 دوره مالی برای پیش‌بینی نیاز است');
    }

    // Sort statements by period (ascending)
    const sorted = statements
      .filter((s) => s.revenue && s.revenue > 0)
      .sort((a, b) => a.period.localeCompare(b.period));

    if (sorted.length < 2) {
      throw new Error('داده‌های کافی برای پیش‌بینی وجود ندارد');
    }

    // Calculate average growth rate
    const growthRates: number[] = [];

    for (let i = 1; i < sorted.length; i++) {
      const growth = (sorted[i].revenue! - sorted[i - 1].revenue!) / sorted[i - 1].revenue!;
      growthRates.push(growth);
    }

    const avgGrowthRate =
      growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;

    // Calculate standard deviation for confidence interval
    const variance =
      growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowthRate, 2), 0) /
      growthRates.length;
    const stdDev = Math.sqrt(variance);

    // Generate forecasts
    const forecasts: RevenueForecast[] = [];
    const lastRevenue = sorted[sorted.length - 1].revenue!;
    const lastPeriod = sorted[sorted.length - 1].period;

    for (let i = 1; i <= periodsAhead; i++) {
      const predictedRevenue = lastRevenue * Math.pow(1 + avgGrowthRate, i);

      // 95% confidence interval (approximately ±2 standard deviations)
      const errorMargin = predictedRevenue * stdDev * 2;

      forecasts.push({
        period: this.getNextPeriod(lastPeriod, i),
        predictedRevenue: Math.round(predictedRevenue),
        confidenceInterval: {
          lower: Math.round(predictedRevenue - errorMargin),
          upper: Math.round(predictedRevenue + errorMargin),
        },
        growthRate: avgGrowthRate,
        methodology: 'میانگین نرخ رشد تاریخی با فاصله اطمینان 95%',
      });
    }

    return forecasts;
  }

  /**
   * Calculate next period label
   */
  private static getNextPeriod(lastPeriod: string, periodsAhead: number): string {
    // Simple implementation - assumes format like "1402-Q1" or "1402"
    const match = lastPeriod.match(/(\d{4})(?:-Q(\d))?/);

    if (!match) {
      return `Future+${periodsAhead}`;
    }

    const year = parseInt(match[1]);
    const quarter = match[2] ? parseInt(match[2]) : null;

    if (quarter) {
      // Quarterly
      const totalQuarters = (quarter - 1) + periodsAhead;
      const newYear = year + Math.floor(totalQuarters / 4);
      const newQuarter = (totalQuarters % 4) + 1;
      return `${newYear}-Q${newQuarter}`;
    } else {
      // Annual
      return `${year + periodsAhead}`;
    }
  }

  /**
   * Predict profitability trend
   */
  static predictProfitabilityTrend(
    statements: FinancialStatement[]
  ): 'Improving' | 'Stable' | 'Declining' {
    if (statements.length < 3) {
      return 'Stable';
    }

    const sorted = statements
      .filter((s) => s.net_income !== undefined && s.revenue && s.revenue > 0)
      .sort((a, b) => a.period.localeCompare(b.period));

    if (sorted.length < 3) {
      return 'Stable';
    }

    // Calculate profit margins
    const margins = sorted.map((s) => s.net_income! / s.revenue!);

    // Check trend
    let improving = 0;
    let declining = 0;

    for (let i = 1; i < margins.length; i++) {
      if (margins[i] > margins[i - 1] * 1.05) improving++;
      if (margins[i] < margins[i - 1] * 0.95) declining++;
    }

    if (improving > declining) return 'Improving';
    if (declining > improving) return 'Declining';
    return 'Stable';
  }
}

export default ForecastingService;
