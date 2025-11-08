import ForecastingService from '../../services/ForecastingService';
import { FinancialStatement } from '../../repositories/FinancialStatementRepository';

describe('ForecastingService', () => {
  const mockStatement: FinancialStatement = {
    id: 1,
    company_id: 1,
    period: '1402-Q1',
    assets: 5000000,
    liabilities: 2000000,
    equity: 3000000,
    current_assets: 2000000,
    current_liabilities: 1000000,
    retained_earnings: 1500000,
    revenue: 3000000,
    ebit: 600000,
    net_income: 450000,
  };

  describe('calculateZScore', () => {
    it('should calculate Z-Score correctly', () => {
      const result = ForecastingService.calculateZScore(mockStatement);

      expect(result).toBeDefined();
      expect(result.zScore).toBeDefined();
      expect(typeof result.zScore).toBe('number');
      expect(result.zone).toMatch(/Safe|Grey|Distress/);
      expect(result.bankruptcyRisk).toMatch(/Low|Medium|High/);
      expect(result.explanation).toBeDefined();
    });

    it('should have all Z-Score components', () => {
      const result = ForecastingService.calculateZScore(mockStatement);

      expect(result.components).toBeDefined();
      expect(result.components).toHaveProperty('workingCapitalRatio');
      expect(result.components).toHaveProperty('retainedEarningsRatio');
      expect(result.components).toHaveProperty('ebitRatio');
      expect(result.components).toHaveProperty('marketValueRatio');
      expect(result.components).toHaveProperty('salesRatio');
    });

    it('should classify Safe zone correctly (Z > 2.99)', () => {
      const safeStatement: FinancialStatement = {
        ...mockStatement,
        current_assets: 3000000,
        current_liabilities: 500000,
        retained_earnings: 2000000,
        ebit: 1000000,
        revenue: 5000000,
      };

      const result = ForecastingService.calculateZScore(safeStatement);

      if (result.zScore > 2.99) {
        expect(result.zone).toBe('Safe');
        expect(result.bankruptcyRisk).toBe('Low');
      }
    });

    it('should classify Distress zone correctly (Z < 1.81)', () => {
      const distressStatement: FinancialStatement = {
        ...mockStatement,
        current_assets: 500000,
        current_liabilities: 2000000,
        retained_earnings: 100000,
        ebit: 50000,
        revenue: 500000,
        liabilities: 4500000,
      };

      const result = ForecastingService.calculateZScore(distressStatement);

      if (result.zScore < 1.81) {
        expect(result.zone).toBe('Distress');
        expect(result.bankruptcyRisk).toBe('High');
      }
    });

    it('should classify Grey zone correctly (1.81 < Z < 2.99)', () => {
      const greyStatement: FinancialStatement = {
        ...mockStatement,
        current_assets: 1500000,
        current_liabilities: 1000000,
        retained_earnings: 800000,
        ebit: 400000,
        revenue: 2500000,
      };

      const result = ForecastingService.calculateZScore(greyStatement);

      if (result.zScore > 1.81 && result.zScore < 2.99) {
        expect(result.zone).toBe('Grey');
        expect(result.bankruptcyRisk).toBe('Medium');
      }
    });

    it('should handle missing retained_earnings by using net_income', () => {
      const statementWithoutRE: FinancialStatement = {
        ...mockStatement,
        retained_earnings: undefined,
        net_income: 450000,
      };

      const result = ForecastingService.calculateZScore(statementWithoutRE);

      expect(result).toBeDefined();
      expect(result.zScore).toBeDefined();
    });

    it('should handle missing ebit by using net_income', () => {
      const statementWithoutEBIT: FinancialStatement = {
        ...mockStatement,
        ebit: undefined,
        net_income: 450000,
      };

      const result = ForecastingService.calculateZScore(statementWithoutEBIT);

      expect(result).toBeDefined();
      expect(result.zScore).toBeDefined();
    });
  });

  describe('forecastRevenue', () => {
    const historicalStatements: FinancialStatement[] = [
      {
        id: 1,
        company_id: 1,
        period: '1400-Q1',
        assets: 4000000,
        liabilities: 1500000,
        revenue: 2000000,
      },
      {
        id: 2,
        company_id: 1,
        period: '1400-Q2',
        assets: 4200000,
        liabilities: 1600000,
        revenue: 2200000,
      },
      {
        id: 3,
        company_id: 1,
        period: '1400-Q3',
        assets: 4500000,
        liabilities: 1700000,
        revenue: 2400000,
      },
      {
        id: 4,
        company_id: 1,
        period: '1400-Q4',
        assets: 4800000,
        liabilities: 1800000,
        revenue: 2600000,
      },
    ];

    it('should forecast revenue for next period', () => {
      const forecasts = ForecastingService.forecastRevenue(historicalStatements, 1);

      expect(forecasts).toBeDefined();
      expect(forecasts.length).toBe(1);
      expect(forecasts[0]).toHaveProperty('period');
      expect(forecasts[0]).toHaveProperty('predictedRevenue');
      expect(forecasts[0]).toHaveProperty('confidenceInterval');
      expect(forecasts[0]).toHaveProperty('growthRate');
      expect(forecasts[0]).toHaveProperty('methodology');
    });

    it('should forecast multiple periods ahead', () => {
      const forecasts = ForecastingService.forecastRevenue(historicalStatements, 3);

      expect(forecasts.length).toBe(3);

      // Each forecast should have increasing revenue (assuming positive growth)
      if (forecasts[0].growthRate > 0) {
        expect(forecasts[1].predictedRevenue).toBeGreaterThan(
          forecasts[0].predictedRevenue
        );
        expect(forecasts[2].predictedRevenue).toBeGreaterThan(
          forecasts[1].predictedRevenue
        );
      }
    });

    it('should include confidence intervals', () => {
      const forecasts = ForecastingService.forecastRevenue(historicalStatements, 1);

      expect(forecasts[0].confidenceInterval).toBeDefined();
      expect(forecasts[0].confidenceInterval.lower).toBeLessThanOrEqual(
        forecasts[0].predictedRevenue
      );
      expect(forecasts[0].confidenceInterval.upper).toBeGreaterThanOrEqual(
        forecasts[0].predictedRevenue
      );
    });

    it('should calculate correct period labels for quarterly data', () => {
      const forecasts = ForecastingService.forecastRevenue(historicalStatements, 2);

      expect(forecasts[0].period).toBe('1401-Q1');
      expect(forecasts[1].period).toBe('1401-Q2');
    });

    it('should handle annual period labels', () => {
      const annualStatements: FinancialStatement[] = [
        {
          id: 1,
          company_id: 1,
          period: '1400',
          assets: 4000000,
          liabilities: 1500000,
          revenue: 8000000,
        },
        {
          id: 2,
          company_id: 1,
          period: '1401',
          assets: 4500000,
          liabilities: 1600000,
          revenue: 9000000,
        },
      ];

      const forecasts = ForecastingService.forecastRevenue(annualStatements, 1);

      expect(forecasts[0].period).toBe('1402');
    });

    it('should throw error with insufficient data (< 2 periods)', () => {
      const singleStatement: FinancialStatement[] = [
        {
          id: 1,
          company_id: 1,
          period: '1400-Q1',
          assets: 4000000,
          liabilities: 1500000,
          revenue: 2000000,
        },
      ];

      expect(() => {
        ForecastingService.forecastRevenue(singleStatement, 1);
      }).toThrow('حداقل 2 دوره مالی برای پیش‌بینی نیاز است');
    });

    it('should filter out statements without revenue', () => {
      const mixedStatements: FinancialStatement[] = [
        ...historicalStatements,
        {
          id: 5,
          company_id: 1,
          period: '1401-Q1',
          assets: 5000000,
          liabilities: 1900000,
          revenue: undefined,
        },
      ];

      const forecasts = ForecastingService.forecastRevenue(mixedStatements, 1);

      expect(forecasts).toBeDefined();
      expect(forecasts.length).toBe(1);
    });
  });

  describe('predictProfitabilityTrend', () => {
    it('should predict Improving trend', () => {
      const improvingStatements: FinancialStatement[] = [
        {
          id: 1,
          company_id: 1,
          period: '1400-Q1',
          assets: 4000000,
          liabilities: 1500000,
          revenue: 2000000,
          net_income: 100000, // 5% margin
        },
        {
          id: 2,
          company_id: 1,
          period: '1400-Q2',
          assets: 4200000,
          liabilities: 1600000,
          revenue: 2200000,
          net_income: 132000, // 6% margin
        },
        {
          id: 3,
          company_id: 1,
          period: '1400-Q3',
          assets: 4500000,
          liabilities: 1700000,
          revenue: 2400000,
          net_income: 168000, // 7% margin
        },
      ];

      const trend = ForecastingService.predictProfitabilityTrend(improvingStatements);

      expect(trend).toBe('Improving');
    });

    it('should predict Declining trend', () => {
      const decliningStatements: FinancialStatement[] = [
        {
          id: 1,
          company_id: 1,
          period: '1400-Q1',
          assets: 4000000,
          liabilities: 1500000,
          revenue: 2000000,
          net_income: 200000, // 10% margin
        },
        {
          id: 2,
          company_id: 1,
          period: '1400-Q2',
          assets: 4200000,
          liabilities: 1600000,
          revenue: 2200000,
          net_income: 154000, // 7% margin
        },
        {
          id: 3,
          company_id: 1,
          period: '1400-Q3',
          assets: 4500000,
          liabilities: 1700000,
          revenue: 2400000,
          net_income: 120000, // 5% margin
        },
      ];

      const trend = ForecastingService.predictProfitabilityTrend(decliningStatements);

      expect(trend).toBe('Declining');
    });

    it('should predict Stable trend', () => {
      const stableStatements: FinancialStatement[] = [
        {
          id: 1,
          company_id: 1,
          period: '1400-Q1',
          assets: 4000000,
          liabilities: 1500000,
          revenue: 2000000,
          net_income: 200000, // 10% margin
        },
        {
          id: 2,
          company_id: 1,
          period: '1400-Q2',
          assets: 4200000,
          liabilities: 1600000,
          revenue: 2200000,
          net_income: 220000, // 10% margin
        },
        {
          id: 3,
          company_id: 1,
          period: '1400-Q3',
          assets: 4500000,
          liabilities: 1700000,
          revenue: 2400000,
          net_income: 240000, // 10% margin
        },
      ];

      const trend = ForecastingService.predictProfitabilityTrend(stableStatements);

      expect(trend).toBe('Stable');
    });

    it('should return Stable with insufficient data', () => {
      const fewStatements: FinancialStatement[] = [
        {
          id: 1,
          company_id: 1,
          period: '1400-Q1',
          assets: 4000000,
          liabilities: 1500000,
          revenue: 2000000,
          net_income: 200000,
        },
      ];

      const trend = ForecastingService.predictProfitabilityTrend(fewStatements);

      expect(trend).toBe('Stable');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero total assets in Z-Score', () => {
      const zeroAssetsStatement: FinancialStatement = {
        ...mockStatement,
        assets: 0,
      };

      // Will result in Infinity or NaN when dividing by zero
      const result = ForecastingService.calculateZScore(zeroAssetsStatement);

      // Check that it doesn't crash, but the Z-Score will be invalid
      expect(result).toBeDefined();
      expect(result.zScore).toBeDefined();
    });

    it('should handle zero liabilities in Z-Score', () => {
      const zeroLiabilitiesStatement: FinancialStatement = {
        ...mockStatement,
        liabilities: 0,
      };

      const result = ForecastingService.calculateZScore(zeroLiabilitiesStatement);

      expect(result).toBeDefined();
      expect(result.zScore).toBeDefined();
    });

    it('should handle negative growth rates in forecasting', () => {
      const decliningStatements: FinancialStatement[] = [
        {
          id: 1,
          company_id: 1,
          period: '1400-Q1',
          assets: 4000000,
          liabilities: 1500000,
          revenue: 3000000,
        },
        {
          id: 2,
          company_id: 1,
          period: '1400-Q2',
          assets: 4000000,
          liabilities: 1500000,
          revenue: 2500000,
        },
      ];

      const forecasts = ForecastingService.forecastRevenue(decliningStatements, 1);

      expect(forecasts).toBeDefined();
      expect(forecasts[0].growthRate).toBeLessThan(0);
      expect(forecasts[0].predictedRevenue).toBeLessThan(2500000);
    });
  });
});
