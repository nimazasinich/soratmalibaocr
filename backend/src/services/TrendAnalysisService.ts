import { FinancialStatement } from '../repositories/FinancialStatementRepository';

export interface TrendPoint {
  period: string;
  value: number;
}

export interface TrendAnalysis {
  metric: string;
  data: TrendPoint[];
  trend: 'Increasing' | 'Decreasing' | 'Stable';
  changeRate: number; // Percentage change
  averageGrowth: number;
}

export interface BenchmarkComparison {
  metric: string;
  companyValue: number;
  industryAverage: number;
  difference: number; // percentage
  status: 'Above' | 'Below' | 'Equal';
}

export interface ComprehensiveTrendReport {
  companyId: number;
  period: string;
  trends: TrendAnalysis[];
  benchmarks: BenchmarkComparison[];
  summary: string;
}

/**
 * Trend Analysis Service
 * Analyzes financial trends over time and compares with industry benchmarks
 */
export class TrendAnalysisService {
  /**
   * Analyze revenue trend
   */
  static analyzeRevenueTrend(statements: FinancialStatement[]): TrendAnalysis {
    const data = statements
      .filter((s) => s.revenue && s.revenue > 0)
      .map((s) => ({ period: s.period, value: s.revenue! }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return this.calculateTrend('Revenue', data);
  }

  /**
   * Analyze profit margin trend
   */
  static analyzeProfitMarginTrend(statements: FinancialStatement[]): TrendAnalysis {
    const data = statements
      .filter((s) => s.net_income !== undefined && s.revenue && s.revenue > 0)
      .map((s) => ({
        period: s.period,
        value: (s.net_income! / s.revenue!) * 100,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return this.calculateTrend('Profit Margin', data);
  }

  /**
   * Analyze asset growth trend
   */
  static analyzeAssetGrowthTrend(statements: FinancialStatement[]): TrendAnalysis {
    const data = statements
      .filter((s) => s.assets && s.assets > 0)
      .map((s) => ({ period: s.period, value: s.assets }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return this.calculateTrend('Assets', data);
  }

  /**
   * Analyze debt ratio trend
   */
  static analyzeDebtRatioTrend(statements: FinancialStatement[]): TrendAnalysis {
    const data = statements
      .filter((s) => s.liabilities && s.assets && s.assets > 0)
      .map((s) => ({
        period: s.period,
        value: (s.liabilities / s.assets) * 100,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return this.calculateTrend('Debt Ratio', data);
  }

  /**
   * Analyze ROE trend
   */
  static analyzeROETrend(statements: FinancialStatement[]): TrendAnalysis {
    const data = statements
      .filter((s) => {
        const equity = s.equity || s.assets - s.liabilities;
        return s.net_income !== undefined && equity > 0;
      })
      .map((s) => {
        const equity = s.equity || s.assets - s.liabilities;
        return {
          period: s.period,
          value: (s.net_income! / equity) * 100,
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));

    return this.calculateTrend('ROE', data);
  }

  /**
   * Calculate trend from data points
   */
  private static calculateTrend(metric: string, data: TrendPoint[]): TrendAnalysis {
    if (data.length === 0) {
      return {
        metric,
        data: [],
        trend: 'Stable',
        changeRate: 0,
        averageGrowth: 0,
      };
    }

    // Calculate growth rates
    const growthRates: number[] = [];

    for (let i = 1; i < data.length; i++) {
      const prevValue = data[i - 1].value;
      const currValue = data[i].value;

      if (prevValue > 0) {
        const growth = ((currValue - prevValue) / prevValue) * 100;
        growthRates.push(growth);
      }
    }

    // Average growth rate
    const averageGrowth =
      growthRates.length > 0
        ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
        : 0;

    // Overall change rate (first to last)
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const changeRate = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    // Determine trend
    let trend: 'Increasing' | 'Decreasing' | 'Stable';

    if (averageGrowth > 2) {
      trend = 'Increasing';
    } else if (averageGrowth < -2) {
      trend = 'Decreasing';
    } else {
      trend = 'Stable';
    }

    return {
      metric,
      data,
      trend,
      changeRate: Math.round(changeRate * 100) / 100,
      averageGrowth: Math.round(averageGrowth * 100) / 100,
    };
  }

  /**
   * Compare with industry benchmarks
   */
  static comparWithIndustry(
    statement: FinancialStatement,
    industryBenchmarks: Record<string, number>
  ): BenchmarkComparison[] {
    const comparisons: BenchmarkComparison[] = [];

    // Current Ratio
    if (statement.current_assets && statement.current_liabilities) {
      const currentRatio = statement.current_assets / statement.current_liabilities;
      const industryAvg = industryBenchmarks.currentRatio || 1.5;

      comparisons.push(
        this.createComparison('Current Ratio', currentRatio, industryAvg)
      );
    }

    // Debt to Equity
    const equity = statement.equity || statement.assets - statement.liabilities;
    if (equity > 0) {
      const debtToEquity = statement.liabilities / equity;
      const industryAvg = industryBenchmarks.debtToEquity || 1.0;

      comparisons.push(
        this.createComparison('Debt to Equity', debtToEquity, industryAvg)
      );
    }

    // Profit Margin
    if (statement.net_income && statement.revenue && statement.revenue > 0) {
      const profitMargin = (statement.net_income / statement.revenue) * 100;
      const industryAvg = industryBenchmarks.profitMargin || 10;

      comparisons.push(
        this.createComparison('Profit Margin', profitMargin, industryAvg)
      );
    }

    // ROE
    if (statement.net_income && equity > 0) {
      const roe = (statement.net_income / equity) * 100;
      const industryAvg = industryBenchmarks.roe || 15;

      comparisons.push(this.createComparison('ROE', roe, industryAvg));
    }

    return comparisons;
  }

  /**
   * Create benchmark comparison
   */
  private static createComparison(
    metric: string,
    companyValue: number,
    industryAverage: number
  ): BenchmarkComparison {
    const difference = ((companyValue - industryAverage) / industryAverage) * 100;

    let status: 'Above' | 'Below' | 'Equal';

    if (Math.abs(difference) < 5) {
      status = 'Equal';
    } else if (difference > 0) {
      status = 'Above';
    } else {
      status = 'Below';
    }

    return {
      metric,
      companyValue: Math.round(companyValue * 100) / 100,
      industryAverage: Math.round(industryAverage * 100) / 100,
      difference: Math.round(difference * 100) / 100,
      status,
    };
  }

  /**
   * Generate comprehensive trend report
   */
  static generateComprehensiveReport(
    companyId: number,
    statements: FinancialStatement[],
    industryBenchmarks?: Record<string, number>
  ): ComprehensiveTrendReport {
    const trends: TrendAnalysis[] = [];

    // Analyze various trends
    trends.push(this.analyzeRevenueTrend(statements));
    trends.push(this.analyzeProfitMarginTrend(statements));
    trends.push(this.analyzeAssetGrowthTrend(statements));
    trends.push(this.analyzeDebtRatioTrend(statements));
    trends.push(this.analyzeROETrend(statements));

    // Benchmark comparison
    const benchmarks = industryBenchmarks
      ? this.comparWithIndustry(
          statements[statements.length - 1],
          industryBenchmarks
        )
      : [];

    // Generate summary
    const summary = this.generateSummary(trends, benchmarks);

    return {
      companyId,
      period: statements[statements.length - 1]?.period || 'N/A',
      trends,
      benchmarks,
      summary,
    };
  }

  /**
   * Generate Persian summary
   */
  private static generateSummary(
    trends: TrendAnalysis[],
    benchmarks: BenchmarkComparison[]
  ): string {
    const lines: string[] = [];

    lines.push('📊 تحلیل روند:');

    trends.forEach((trend) => {
      if (trend.data.length > 0) {
        const icon =
          trend.trend === 'Increasing'
            ? '📈'
            : trend.trend === 'Decreasing'
            ? '📉'
            : '➡️';

        lines.push(
          `${icon} ${trend.metric}: ${trend.trend} (${trend.averageGrowth.toFixed(1)}% رشد میانگین)`
        );
      }
    });

    if (benchmarks.length > 0) {
      lines.push('');
      lines.push('🎯 مقایسه با صنعت:');

      benchmarks.forEach((benchmark) => {
        const icon =
          benchmark.status === 'Above'
            ? '✅'
            : benchmark.status === 'Below'
            ? '⚠️'
            : '➖';

        lines.push(
          `${icon} ${benchmark.metric}: ${benchmark.companyValue.toFixed(2)} (صنعت: ${benchmark.industryAverage.toFixed(2)})`
        );
      });
    }

    return lines.join('\n');
  }
}

export default TrendAnalysisService;
