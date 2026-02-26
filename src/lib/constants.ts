import { CardPreset } from './types';

/**
 * Opportunity-cost model used throughout this app:
 *
 * earningCost = 1 / earningRate
 *
 * Interpretation: if you could earn 1p per £1 from a standard 1% cashback card,
 * then by using a BA Avios card earning `earningRate` Avios per £1 instead,
 * each Avios "costs" you (1p / earningRate) in foregone cashback.
 *
 * For Premium Plus at 1.5 Avios/£1: earningCost = 1/1.5 ≈ 0.6667p per Avios.
 * For the free card at 1.0 Avios/£1: earningCost = 1/1.0 = 1.0p per Avios.
 *
 * profitMargin = ((valuePerAvios / earningCost) - 1) × 100
 * A 0% margin means the redemption exactly recovers your earning cost.
 * A +150% margin means you got 2.5× your earning cost back.
 *
 * Assumption: the 1p/£1 cashback baseline is fixed. Users who have a higher-value
 * alternative (e.g. 2% cashback) should use the custom earning rate to reflect
 * their actual opportunity cost.
 */
export const CARD_PRESETS: CardPreset[] = [
  {
    id: 'premium-plus',
    name: 'BA American Express Premium Plus',
    earningRate: 1.5,
    // 1p ÷ 1.5 Avios = 0.6667p per Avios (computed precisely; do not round to 0.67)
    earningCost: parseFloat((1 / 1.5).toFixed(4)),
    annualFee: 300,
    description: 'Black card - 1.5 Avios per £1 spent',
  },
  {
    id: 'free',
    name: 'BA American Express (Free)',
    earningRate: 1.0,
    // 1p ÷ 1.0 Avios = 1.0p per Avios
    earningCost: 1.0,
    annualFee: 0,
    description: 'Free card - 1 Avios per £1 spent',
  },
  {
    id: 'custom',
    name: 'Custom Earning Rate',
    earningRate: 1.0,
    earningCost: 1.0,
    annualFee: 0,
    description: 'Enter your own earning rate',
  },
];

/**
 * Profit-margin thresholds (multipliers; multiply by 100 for the % value).
 * These drive both the `recommendation` field on CalculationResult and the
 * explanatory text in RecommendationCard. Always reference these constants
 * rather than hardcoding numeric values in UI components.
 */
export const RECOMMENDATION_THRESHOLDS = {
  excellent: 1.5, // profitMargin >= 150%: value/Avios ≥ 2.5× earningCost
  good: 0.5,      // profitMargin >= 50%:  value/Avios ≥ 1.5× earningCost
  ok: 0.0,        // profitMargin >= 0%:   break-even or better
  // below 0%: 'poor' — Avios opportunity cost exceeds cash saving
};
