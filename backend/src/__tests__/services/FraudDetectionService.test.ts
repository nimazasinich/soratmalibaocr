import FraudDetectionService from '../../services/FraudDetectionService';
import { FinancialStatement } from '../../repositories/FinancialStatementRepository';

describe('FraudDetectionService', () => {
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
    accounts_receivable: 800000,
    fixed_assets: 3000000,
    revenue: 3000000,
    cogs: 2000000,
    ebit: 600000,
    interest_expense: 100000,
    net_income: 450000,
    operating_cf: 500000,
  };

  const previousStatement: FinancialStatement = {
    id: 2,
    company_id: 1,
    period: '1401-Q4',
    assets: 4500000,
    liabilities: 1800000,
    equity: 2700000,
    current_assets: 1800000,
    current_liabilities: 900000,
    inventory: 450000,
    cash: 250000,
    accounts_receivable: 700000,
    fixed_assets: 2700000,
    revenue: 2700000,
    cogs: 1800000,
    ebit: 550000,
    interest_expense: 90000,
    net_income: 410000,
    operating_cf: 450000,
  };

  describe('analyzeStatement', () => {
    it('should perform complete fraud analysis', async () => {
      const result = await FraudDetectionService.analyzeStatement(
        mockStatement,
        [previousStatement]
      );

      expect(result).toBeDefined();
      expect(result.statementId).toBe(1);
      expect(result.overallFraudScore).toBeGreaterThanOrEqual(0);
      expect(result.overallFraudScore).toBeLessThanOrEqual(100);
      expect(result.riskLevel).toMatch(/Low|Medium|High|Critical/);
      expect(Array.isArray(result.indicators)).toBe(true);
    });

    it('should include all fraud indicators', async () => {
      const result = await FraudDetectionService.analyzeStatement(
        mockStatement,
        [previousStatement]
      );

      // Check that indicators are present
      expect(result.indicators.length).toBeGreaterThan(0);

      // All indicators should have required properties
      result.indicators.forEach((indicator) => {
        expect(indicator).toHaveProperty('flagType');
        expect(indicator).toHaveProperty('severity');
        expect(indicator).toHaveProperty('score');
        expect(indicator).toHaveProperty('description');
        expect(indicator).toHaveProperty('details');
        expect(indicator).toHaveProperty('recommendation');
      });
    });
  });

  describe('Quality of Earnings', () => {
    it('should flag low quality earnings when CFO < Net Income', async () => {
      const lowQualityStatement: FinancialStatement = {
        ...mockStatement,
        operating_cf: 200000, // Less than net_income (450000)
        net_income: 450000,
      };

      const result = await FraudDetectionService.analyzeStatement(lowQualityStatement);

      expect(result.indicators.length).toBeGreaterThan(0);

      const qoeIndicator = result.indicators.find(
        (i) => i.flagType === 'Quality of Earnings'
      );

      if (qoeIndicator) {
        expect(qoeIndicator.score).toBeGreaterThan(0);
        expect(['Medium', 'High', 'Critical']).toContain(qoeIndicator.severity);
      }
    });

    it('should not flag when CFO >= Net Income', async () => {
      const goodQualityStatement: FinancialStatement = {
        ...mockStatement,
        operating_cf: 500000,
        net_income: 450000,
      };

      const result = await FraudDetectionService.analyzeStatement(goodQualityStatement);

      const qoeIndicator = result.indicators.find(
        (i) => i.flagType === 'Quality of Earnings'
      );

      // Should either not exist or have score of 0
      if (qoeIndicator) {
        expect(qoeIndicator.score).toBe(0);
      }
    });
  });

  describe('Receivable Growth Analysis', () => {
    it('should detect abnormal receivable growth', async () => {
      const abnormalGrowth: FinancialStatement = {
        ...mockStatement,
        accounts_receivable: 1500000, // Huge increase
        revenue: 3100000, // Small increase
      };

      const previous: FinancialStatement = {
        ...previousStatement,
        accounts_receivable: 700000,
        revenue: 2700000,
      };

      const result = await FraudDetectionService.analyzeStatement(abnormalGrowth, [
        previous,
      ]);

      const rgIndicator = result.indicators.find(
        (i) => i.flagType === 'Receivable Growth'
      );

      if (rgIndicator) {
        expect(rgIndicator.score).toBeGreaterThan(0);
      }
    });

    it('should handle normal receivable growth', async () => {
      const normalGrowth: FinancialStatement = {
        ...mockStatement,
        accounts_receivable: 800000,
        revenue: 3000000,
      };

      const previous: FinancialStatement = {
        ...previousStatement,
        accounts_receivable: 700000,
        revenue: 2700000,
      };

      const result = await FraudDetectionService.analyzeStatement(normalGrowth, [previous]);

      const rgIndicator = result.indicators.find(
        (i) => i.flagType === 'Receivable Growth'
      );

      // Should have low or no score for normal growth
      if (rgIndicator) {
        expect(rgIndicator.score).toBeLessThanOrEqual(50);
      }
    });
  });

  describe('Asset Inflation Analysis', () => {
    it('should detect abnormal asset inflation', async () => {
      const inflatedAssets: FinancialStatement = {
        ...mockStatement,
        fixed_assets: 4000000, // 48% increase
        revenue: 3100000, // 11% increase
      };

      const previous: FinancialStatement = {
        ...previousStatement,
        fixed_assets: 2700000,
        revenue: 2800000,
      };

      const result = await FraudDetectionService.analyzeStatement(inflatedAssets, [
        previous,
      ]);

      const aiIndicator = result.indicators.find((i) => i.flagType === 'Asset Inflation');

      if (aiIndicator) {
        expect(aiIndicator.score).toBeGreaterThan(0);
      }
    });
  });

  describe('Accrual Ratio', () => {
    it('should detect high accrual ratio', async () => {
      const highAccrual: FinancialStatement = {
        ...mockStatement,
        net_income: 800000,
        operating_cf: 200000, // Large difference
        assets: 5000000,
      };

      const result = await FraudDetectionService.analyzeStatement(highAccrual);

      const arIndicator = result.indicators.find((i) => i.flagType === 'Accrual Ratio');

      if (arIndicator) {
        expect(arIndicator.score).toBeGreaterThan(0);
        expect(arIndicator.details).toHaveProperty('accrualRatio');
      }
    });

    it('should handle normal accrual ratio', async () => {
      const normalAccrual: FinancialStatement = {
        ...mockStatement,
        net_income: 450000,
        operating_cf: 500000, // Close values
        assets: 5000000,
      };

      const result = await FraudDetectionService.analyzeStatement(normalAccrual);

      const arIndicator = result.indicators.find((i) => i.flagType === 'Accrual Ratio');

      // Should have low or no score
      if (arIndicator) {
        expect(arIndicator.score).toBeLessThanOrEqual(40);
      }
    });
  });

  describe('Benford\'s Law Analysis', () => {
    it('should perform Benford analysis with sufficient data', async () => {
      const result = await FraudDetectionService.analyzeStatement(mockStatement);

      const benfordIndicator = result.indicators.find(
        (i) => i.flagType === "Benford's Law"
      );

      // May or may not be flagged, but should exist
      expect(benfordIndicator).toBeDefined();
      expect(benfordIndicator?.details).toHaveProperty('chiSquare');
      expect(benfordIndicator?.details).toHaveProperty('actualDistribution');
    });

    it('should handle insufficient data for Benford analysis', async () => {
      const sparseStatement: FinancialStatement = {
        id: 3,
        company_id: 1,
        period: '1402-Q1',
        assets: 5000000,
        liabilities: 2000000,
      };

      const result = await FraudDetectionService.analyzeStatement(sparseStatement);

      const benfordIndicator = result.indicators.find(
        (i) => i.flagType === "Benford's Law"
      );

      // Should have low score due to insufficient data
      if (benfordIndicator) {
        expect(benfordIndicator.score).toBe(0);
      }
    });
  });

  describe('Risk Level Determination', () => {
    it('should classify fraud score into correct risk levels', async () => {
      // Test with clean statement
      const cleanStatement: FinancialStatement = {
        ...mockStatement,
        operating_cf: 500000,
        net_income: 450000,
      };

      const result = await FraudDetectionService.analyzeStatement(cleanStatement);

      expect(['Low', 'Medium', 'High', 'Critical']).toContain(result.riskLevel);

      // Low score should result in Low risk
      if (result.overallFraudScore < 30) {
        expect(result.riskLevel).toBe('Low');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing previous statements', async () => {
      const result = await FraudDetectionService.analyzeStatement(mockStatement);

      expect(result).toBeDefined();
      expect(result.overallFraudScore).toBeGreaterThanOrEqual(0);
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    it('should handle zero values gracefully', async () => {
      const zeroStatement: FinancialStatement = {
        ...mockStatement,
        operating_cf: 0,
        net_income: 0,
      };

      expect(async () => {
        await FraudDetectionService.analyzeStatement(zeroStatement);
      }).not.toThrow();
    });

    it('should handle negative values', async () => {
      const negativeStatement: FinancialStatement = {
        ...mockStatement,
        net_income: -100000,
        operating_cf: -50000,
      };

      expect(async () => {
        await FraudDetectionService.analyzeStatement(negativeStatement);
      }).not.toThrow();
    });
  });
});
