import { FinancialStatement } from '../repositories/FinancialStatementRepository';

export interface FinancialRatio {
  name: string;
  category: 'Liquidity' | 'Leverage' | 'Profitability' | 'Efficiency' | 'Growth';
  value: number;
  idealValue?: number;
  status: 'Good' | 'Warning' | 'Critical';
  formula: string;
  description: string;
}

export interface RatioAnalysisResult {
  statementId: number;
  companyName?: string;
  period: string;
  ratios: FinancialRatio[];
  overallScore: number;
  categoryScores: {
    liquidity: number;
    leverage: number;
    profitability: number;
    efficiency: number;
  };
}

export class FinancialRatioService {
  /**
   * Calculate all financial ratios for a statement
   */
  static calculateAllRatios(statement: FinancialStatement): FinancialRatio[] {
    const ratios: FinancialRatio[] = [];

    // Liquidity Ratios
    ratios.push(...this.calculateLiquidityRatios(statement));

    // Leverage Ratios
    ratios.push(...this.calculateLeverageRatios(statement));

    // Profitability Ratios
    ratios.push(...this.calculateProfitabilityRatios(statement));

    // Efficiency Ratios
    ratios.push(...this.calculateEfficiencyRatios(statement));

    // Growth Ratios (requires historical data - placeholder for now)
    // Will be implemented in Phase 5 (Trend Analysis)

    return ratios;
  }

  /**
   * Calculate Liquidity Ratios
   */
  private static calculateLiquidityRatios(statement: FinancialStatement): FinancialRatio[] {
    const ratios: FinancialRatio[] = [];

    // Current Ratio = Current Assets / Current Liabilities
    if (statement.current_assets && statement.current_liabilities) {
      const currentRatio = statement.current_assets / statement.current_liabilities;

      ratios.push({
        name: 'Current Ratio',
        category: 'Liquidity',
        value: currentRatio,
        idealValue: 1.5,
        status: currentRatio >= 1.5 ? 'Good' : currentRatio >= 1.0 ? 'Warning' : 'Critical',
        formula: 'Current Assets / Current Liabilities',
        description: 'نسبت جاری - توانایی پرداخت بدهی‌های کوتاه‌مدت',
      });
    }

    // Quick Ratio = (Current Assets - Inventory) / Current Liabilities
    if (
      statement.current_assets &&
      statement.inventory !== undefined &&
      statement.current_liabilities
    ) {
      const quickRatio =
        (statement.current_assets - statement.inventory) / statement.current_liabilities;

      ratios.push({
        name: 'Quick Ratio',
        category: 'Liquidity',
        value: quickRatio,
        idealValue: 1.0,
        status: quickRatio >= 1.0 ? 'Good' : quickRatio >= 0.5 ? 'Warning' : 'Critical',
        formula: '(Current Assets - Inventory) / Current Liabilities',
        description: 'نسبت آنی - نقدینگی فوری بدون موجودی کالا',
      });
    }

    // Cash Ratio = Cash / Current Liabilities
    if (statement.cash && statement.current_liabilities) {
      const cashRatio = statement.cash / statement.current_liabilities;

      ratios.push({
        name: 'Cash Ratio',
        category: 'Liquidity',
        value: cashRatio,
        idealValue: 0.2,
        status: cashRatio >= 0.2 ? 'Good' : cashRatio >= 0.1 ? 'Warning' : 'Critical',
        formula: 'Cash / Current Liabilities',
        description: 'نسبت نقدی - توان پرداخت نقدی بدهی‌ها',
      });
    }

    return ratios;
  }

  /**
   * Calculate Leverage Ratios
   */
  private static calculateLeverageRatios(statement: FinancialStatement): FinancialRatio[] {
    const ratios: FinancialRatio[] = [];

    // Calculate equity if not provided
    const equity = statement.equity || statement.assets - statement.liabilities;

    // Debt to Equity Ratio = Total Liabilities / Equity
    if (equity > 0) {
      const debtToEquity = statement.liabilities / equity;

      ratios.push({
        name: 'Debt to Equity',
        category: 'Leverage',
        value: debtToEquity,
        idealValue: 2.0,
        status: debtToEquity <= 2.0 ? 'Good' : debtToEquity <= 3.0 ? 'Warning' : 'Critical',
        formula: 'Total Liabilities / Equity',
        description: 'نسبت بدهی به حقوق صاحبان سهام',
      });
    }

    // Debt Ratio = Total Liabilities / Total Assets
    const debtRatio = statement.liabilities / statement.assets;

    ratios.push({
      name: 'Debt Ratio',
      category: 'Leverage',
      value: debtRatio,
      idealValue: 0.5,
      status: debtRatio <= 0.5 ? 'Good' : debtRatio <= 0.7 ? 'Warning' : 'Critical',
      formula: 'Total Liabilities / Total Assets',
      description: 'نسبت بدهی - درصد دارایی‌های تامین شده از بدهی',
    });

    // Times Interest Earned (TIE) = EBIT / Interest Expense
    if (statement.ebit && statement.interest_expense && statement.interest_expense > 0) {
      const tie = statement.ebit / statement.interest_expense;

      ratios.push({
        name: 'Times Interest Earned',
        category: 'Leverage',
        value: tie,
        idealValue: 2.0,
        status: tie >= 2.0 ? 'Good' : tie >= 1.0 ? 'Warning' : 'Critical',
        formula: 'EBIT / Interest Expense',
        description: 'توانایی پرداخت هزینه بهره',
      });
    }

    return ratios;
  }

  /**
   * Calculate Profitability Ratios
   */
  private static calculateProfitabilityRatios(
    statement: FinancialStatement
  ): FinancialRatio[] {
    const ratios: FinancialRatio[] = [];

    // Net Profit Margin = Net Income / Revenue
    if (statement.net_income && statement.revenue && statement.revenue > 0) {
      const netMargin = statement.net_income / statement.revenue;

      ratios.push({
        name: 'Net Profit Margin',
        category: 'Profitability',
        value: netMargin,
        status: netMargin >= 0.1 ? 'Good' : netMargin >= 0.05 ? 'Warning' : 'Critical',
        formula: 'Net Income / Revenue',
        description: 'حاشیه سود خالص - درصد سود از فروش',
      });
    }

    // Return on Assets (ROA) = Net Income / Total Assets
    if (statement.net_income && statement.assets > 0) {
      const roa = statement.net_income / statement.assets;

      ratios.push({
        name: 'Return on Assets (ROA)',
        category: 'Profitability',
        value: roa,
        status: roa >= 0.05 ? 'Good' : roa >= 0.02 ? 'Warning' : 'Critical',
        formula: 'Net Income / Total Assets',
        description: 'بازده دارایی - کارایی استفاده از دارایی‌ها',
      });
    }

    // Return on Equity (ROE) = Net Income / Equity
    if (statement.net_income) {
      const equity = statement.equity || statement.assets - statement.liabilities;

      if (equity > 0) {
        const roe = statement.net_income / equity;

        ratios.push({
          name: 'Return on Equity (ROE)',
          category: 'Profitability',
          value: roe,
          status: roe >= 0.15 ? 'Good' : roe >= 0.08 ? 'Warning' : 'Critical',
          formula: 'Net Income / Equity',
          description: 'بازده حقوق صاحبان سهام',
        });
      }
    }

    // Gross Profit Margin = Gross Profit / Revenue
    if (statement.gross_profit && statement.revenue && statement.revenue > 0) {
      const grossMargin = statement.gross_profit / statement.revenue;

      ratios.push({
        name: 'Gross Profit Margin',
        category: 'Profitability',
        value: grossMargin,
        status: grossMargin >= 0.3 ? 'Good' : grossMargin >= 0.2 ? 'Warning' : 'Critical',
        formula: 'Gross Profit / Revenue',
        description: 'حاشیه سود ناخالص',
      });
    }

    return ratios;
  }

  /**
   * Calculate Efficiency Ratios
   */
  private static calculateEfficiencyRatios(statement: FinancialStatement): FinancialRatio[] {
    const ratios: FinancialRatio[] = [];

    // Asset Turnover = Revenue / Total Assets
    if (statement.revenue && statement.assets > 0) {
      const assetTurnover = statement.revenue / statement.assets;

      ratios.push({
        name: 'Asset Turnover',
        category: 'Efficiency',
        value: assetTurnover,
        status: assetTurnover >= 1.0 ? 'Good' : assetTurnover >= 0.5 ? 'Warning' : 'Critical',
        formula: 'Revenue / Total Assets',
        description: 'گردش دارایی - کارایی تولید درآمد از دارایی',
      });
    }

    // Inventory Turnover = COGS / Inventory
    if (statement.cogs && statement.inventory && statement.inventory > 0) {
      const inventoryTurnover = statement.cogs / statement.inventory;

      ratios.push({
        name: 'Inventory Turnover',
        category: 'Efficiency',
        value: inventoryTurnover,
        status:
          inventoryTurnover >= 5.0 ? 'Good' : inventoryTurnover >= 3.0 ? 'Warning' : 'Critical',
        formula: 'COGS / Inventory',
        description: 'گردش موجودی کالا',
      });
    }

    // Receivables Turnover = Revenue / Accounts Receivable
    if (
      statement.revenue &&
      statement.accounts_receivable &&
      statement.accounts_receivable > 0
    ) {
      const receivablesTurnover = statement.revenue / statement.accounts_receivable;

      ratios.push({
        name: 'Receivables Turnover',
        category: 'Efficiency',
        value: receivablesTurnover,
        status:
          receivablesTurnover >= 8.0 ? 'Good' : receivablesTurnover >= 5.0 ? 'Warning' : 'Critical',
        formula: 'Revenue / Accounts Receivable',
        description: 'گردش حساب‌های دریافتنی',
      });
    }

    return ratios;
  }

  /**
   * Calculate category scores (0-100)
   */
  static calculateCategoryScores(ratios: FinancialRatio[]): {
    liquidity: number;
    leverage: number;
    profitability: number;
    efficiency: number;
  } {
    const categories = {
      liquidity: ratios.filter((r) => r.category === 'Liquidity'),
      leverage: ratios.filter((r) => r.category === 'Leverage'),
      profitability: ratios.filter((r) => r.category === 'Profitability'),
      efficiency: ratios.filter((r) => r.category === 'Efficiency'),
    };

    const scoreRatio = (ratio: FinancialRatio): number => {
      if (ratio.status === 'Good') return 100;
      if (ratio.status === 'Warning') return 60;
      return 20; // Critical
    };

    return {
      liquidity: this.averageScore(categories.liquidity.map(scoreRatio)),
      leverage: this.averageScore(categories.leverage.map(scoreRatio)),
      profitability: this.averageScore(categories.profitability.map(scoreRatio)),
      efficiency: this.averageScore(categories.efficiency.map(scoreRatio)),
    };
  }

  /**
   * Calculate overall score (0-100)
   */
  static calculateOverallScore(categoryScores: {
    liquidity: number;
    leverage: number;
    profitability: number;
    efficiency: number;
  }): number {
    // Weighted average
    return (
      categoryScores.liquidity * 0.2 +
      categoryScores.leverage * 0.2 +
      categoryScores.profitability * 0.4 +
      categoryScores.efficiency * 0.2
    );
  }

  private static averageScore(scores: number[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * Complete analysis with all ratios and scores
   */
  static analyzeStatement(statement: FinancialStatement): RatioAnalysisResult {
    const ratios = this.calculateAllRatios(statement);
    const categoryScores = this.calculateCategoryScores(ratios);
    const overallScore = this.calculateOverallScore(categoryScores);

    return {
      statementId: statement.id!,
      period: statement.period,
      ratios,
      overallScore,
      categoryScores,
    };
  }
}

export default FinancialRatioService;
