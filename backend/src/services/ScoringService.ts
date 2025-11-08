import { FinancialStatement } from '../repositories/FinancialStatementRepository';
import FinancialRatioService from './FinancialRatioService';
import FraudDetectionService from './FraudDetectionService';

export interface WeightedScore {
  finalScore: number; // 0-100
  liquidityIndex: number; // 0-100
  leverageIndex: number; // 0-100
  profitabilityIndex: number; // 0-100
  efficiencyIndex: number; // 0-100
  fraudRiskIndex: number; // 0-100 (inverse of fraud score)
  rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D';
  recommendation: string;
}

/**
 * Weighted Scoring Service
 * Combines all analysis into a single comprehensive score
 *
 * Formula:
 * FinalScore = 0.20*LiquidityIndex +
 *              0.20*LeverageIndex +
 *              0.30*ProfitabilityIndex +
 *              0.20*EfficiencyIndex +
 *              0.10*FraudRiskIndex
 */
export class ScoringService {
  /**
   * Calculate comprehensive weighted score
   */
  static async calculateWeightedScore(
    statement: FinancialStatement,
    previousStatements?: FinancialStatement[]
  ): Promise<WeightedScore> {
    // Get ratio analysis
    const ratioAnalysis = FinancialRatioService.analyzeStatement(statement);

    // Get fraud analysis
    const fraudAnalysis = await FraudDetectionService.analyzeStatement(
      statement,
      previousStatements
    );

    // Extract category scores
    const liquidityIndex = ratioAnalysis.categoryScores.liquidity;
    const leverageIndex = ratioAnalysis.categoryScores.leverage;
    const profitabilityIndex = ratioAnalysis.categoryScores.profitability;
    const efficiencyIndex = ratioAnalysis.categoryScores.efficiency;

    // Fraud Risk Index (inverse of fraud score - higher is better)
    const fraudRiskIndex = 100 - fraudAnalysis.overallFraudScore;

    // Calculate final weighted score
    const finalScore =
      liquidityIndex * 0.2 +
      leverageIndex * 0.2 +
      profitabilityIndex * 0.3 +
      efficiencyIndex * 0.2 +
      fraudRiskIndex * 0.1;

    // Determine rating
    const rating = this.calculateRating(finalScore);

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      finalScore,
      liquidityIndex,
      leverageIndex,
      profitabilityIndex,
      efficiencyIndex,
      fraudRiskIndex
    );

    return {
      finalScore: Math.round(finalScore * 100) / 100,
      liquidityIndex: Math.round(liquidityIndex * 100) / 100,
      leverageIndex: Math.round(leverageIndex * 100) / 100,
      profitabilityIndex: Math.round(profitabilityIndex * 100) / 100,
      efficiencyIndex: Math.round(efficiencyIndex * 100) / 100,
      fraudRiskIndex: Math.round(fraudRiskIndex * 100) / 100,
      rating,
      recommendation,
    };
  }

  /**
   * Calculate credit-style rating based on final score
   */
  private static calculateRating(
    score: number
  ): 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D' {
    if (score >= 95) return 'AAA';
    if (score >= 90) return 'AA';
    if (score >= 80) return 'A';
    if (score >= 70) return 'BBB';
    if (score >= 60) return 'BB';
    if (score >= 50) return 'B';
    if (score >= 40) return 'CCC';
    if (score >= 30) return 'CC';
    if (score >= 20) return 'C';
    return 'D';
  }

  /**
   * Generate Persian recommendation based on scores
   */
  private static generateRecommendation(
    finalScore: number,
    liquidity: number,
    leverage: number,
    profitability: number,
    efficiency: number,
    fraudRisk: number
  ): string {
    const recommendations: string[] = [];

    // Overall assessment
    if (finalScore >= 80) {
      recommendations.push('✅ شرکت دارای عملکرد مالی عالی است.');
    } else if (finalScore >= 60) {
      recommendations.push('🟡 شرکت دارای عملکرد مالی متوسط رو به بالا است.');
    } else if (finalScore >= 40) {
      recommendations.push('🟠 شرکت دارای عملکرد مالی ضعیف است.');
    } else {
      recommendations.push('🔴 شرکت در وضعیت مالی بحرانی قرار دارد.');
    }

    // Specific weaknesses
    if (liquidity < 50) {
      recommendations.push('⚠️ نقدینگی: توانایی پرداخت بدهی‌های کوتاه‌مدت ضعیف است.');
    }

    if (leverage < 50) {
      recommendations.push('⚠️ اهرم مالی: میزان بدهی بالا و نگران‌کننده است.');
    }

    if (profitability < 50) {
      recommendations.push('⚠️ سودآوری: حاشیه سود پایین و نیاز به بهبود دارد.');
    }

    if (efficiency < 50) {
      recommendations.push('⚠️ کارایی: استفاده از دارایی‌ها بهینه نیست.');
    }

    if (fraudRisk < 50) {
      recommendations.push('🚨 ریسک تقلب: شاخص‌های مشکوک تقلب شناسایی شده است.');
    }

    // Strengths
    if (profitability >= 80) {
      recommendations.push('✅ سودآوری عالی');
    }

    if (liquidity >= 80) {
      recommendations.push('✅ نقدینگی قوی');
    }

    return recommendations.join('\n');
  }
}

export default ScoringService;
