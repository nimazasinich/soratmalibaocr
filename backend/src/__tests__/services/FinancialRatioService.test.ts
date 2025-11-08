import FinancialRatioService from '../../services/FinancialRatioService';
import { FinancialStatement } from '../../repositories/FinancialStatementRepository';

describe('FinancialRatioService', () => {
  const mockStatement: FinancialStatement = {
    id: 1,
    company_id: 1,
    period: '1402-Q1',
    assets: 5000000,
    liabilities: 2000000,
    equity: 3000000,
    current_assets: 2000000,
    current_liabilities: 1000000,
    inventory: 500000,
    cash: 300000,
    revenue: 3000000,
    cogs: 2000000,
    ebit: 600000,
    interest_expense: 100000,
    net_income: 450000,
    operating_cf: 500000,
  };

  describe('calculateAllRatios', () => {
    it('should calculate all financial ratios', () => {
      const ratios = FinancialRatioService.calculateAllRatios(mockStatement);

      expect(ratios).toBeDefined();
      expect(ratios.length).toBeGreaterThan(0);
      expect(ratios[0]).toHaveProperty('name');
      expect(ratios[0]).toHaveProperty('value');
      expect(ratios[0]).toHaveProperty('status');
    });

    it('should calculate current ratio correctly', () => {
      const ratios = FinancialRatioService.calculateAllRatios(mockStatement);
      const currentRatio = ratios.find((r) => r.name === 'Current Ratio');

      expect(currentRatio).toBeDefined();
      expect(currentRatio?.value).toBe(2); // 2000000 / 1000000
      expect(currentRatio?.status).toBe('Good');
    });

    it('should calculate quick ratio correctly', () => {
      const ratios = FinancialRatioService.calculateAllRatios(mockStatement);
      const quickRatio = ratios.find((r) => r.name === 'Quick Ratio');

      expect(quickRatio).toBeDefined();
      expect(quickRatio?.value).toBe(1.5); // (2000000 - 500000) / 1000000
      expect(quickRatio?.status).toBe('Good');
    });

    it('should calculate debt to equity ratio correctly', () => {
      const ratios = FinancialRatioService.calculateAllRatios(mockStatement);
      const debtToEquity = ratios.find((r) => r.name === 'Debt to Equity');

      expect(debtToEquity).toBeDefined();
      expect(debtToEquity?.value).toBeCloseTo(0.67, 2); // 2000000 / 3000000
      expect(debtToEquity?.status).toBe('Good');
    });

    it('should calculate ROE correctly', () => {
      const ratios = FinancialRatioService.calculateAllRatios(mockStatement);
      const roe = ratios.find((r) => r.name === 'Return on Equity (ROE)');

      expect(roe).toBeDefined();
      expect(roe?.value).toBe(0.15); // 450000 / 3000000
      expect(roe?.status).toBe('Good');
    });
  });

  describe('calculateCategoryScores', () => {
    it('should calculate category scores correctly', () => {
      const ratios = FinancialRatioService.calculateAllRatios(mockStatement);
      const scores = FinancialRatioService.calculateCategoryScores(ratios);

      expect(scores).toHaveProperty('liquidity');
      expect(scores).toHaveProperty('leverage');
      expect(scores).toHaveProperty('profitability');
      expect(scores).toHaveProperty('efficiency');

      expect(scores.liquidity).toBeGreaterThanOrEqual(0);
      expect(scores.liquidity).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateOverallScore', () => {
    it('should calculate overall score correctly', () => {
      const ratios = FinancialRatioService.calculateAllRatios(mockStatement);
      const categoryScores = FinancialRatioService.calculateCategoryScores(ratios);
      const overallScore = FinancialRatioService.calculateOverallScore(categoryScores);

      expect(overallScore).toBeGreaterThanOrEqual(0);
      expect(overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('edge cases', () => {
    it('should handle missing data gracefully', () => {
      const incompleteStatement: FinancialStatement = {
        id: 2,
        company_id: 1,
        period: '1402-Q1',
        assets: 5000000,
        liabilities: 2000000,
      };

      const ratios = FinancialRatioService.calculateAllRatios(incompleteStatement);

      expect(ratios).toBeDefined();
      expect(Array.isArray(ratios)).toBe(true);
    });

    it('should handle zero current liabilities', () => {
      const statementWithZero: FinancialStatement = {
        ...mockStatement,
        current_liabilities: 0,
      };

      expect(() => {
        FinancialRatioService.calculateAllRatios(statementWithZero);
      }).not.toThrow();
    });
  });
});
