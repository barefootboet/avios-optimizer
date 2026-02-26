import { AviosOption, CalculationInput, CalculationResult } from './types';
import { RECOMMENDATION_THRESHOLDS } from './constants';

/**
 * Calculates value metrics for a single Avios option.
 *
 * @param option - The Avios + cash option (avios count and cash in pounds).
 * @param cashPrice - Total cash price for the trip (pounds).
 * @param earningCost - Cost in pence to earn 1 Avios (e.g. 0.67 for Premium Plus).
 * @param userAviosBalance - Optional current balance; used for remainingAvios.
 * @returns Result with cashSaved, valuePerAvios (pence), profitMargin (%), totalCost (pounds), recommendation.
 *
 * @example
 * Cash price £850, option 43,000 Avios + £169.40, earning cost 0.67p:
 * - cashSaved = 680.60, valuePerAvios = 1.58p, profitMargin ≈ 136%, totalCost ≈ 457.50
 */
export function calculateOptionValue(
  option: AviosOption,
  cashPrice: number,
  earningCost: number,
  userAviosBalance?: number
): CalculationResult {
  const safeEarningCost = earningCost > 0 && Number.isFinite(earningCost) ? earningCost : 0.67;
  const safeAvios = option.avios > 0 && Number.isFinite(option.avios) ? option.avios : 1;

  const cashSaved = cashPrice - option.cash;
  const valuePerAvios = safeAvios > 0 ? (cashSaved / safeAvios) * 100 : 0;
  const profitMargin = safeEarningCost > 0 ? ((valuePerAvios / safeEarningCost) - 1) * 100 : 0;
  const totalCost = option.cash + (option.avios * safeEarningCost / 100);
  
  // Determine recommendation level
  let recommendation: CalculationResult['recommendation'];
  if (profitMargin >= RECOMMENDATION_THRESHOLDS.excellent * 100) {
    recommendation = 'excellent';
  } else if (profitMargin >= RECOMMENDATION_THRESHOLDS.good * 100) {
    recommendation = 'good';
  } else if (profitMargin >= RECOMMENDATION_THRESHOLDS.ok * 100) {
    recommendation = 'ok';
  } else {
    recommendation = 'poor';
  }
  
  return {
    option,
    cashSaved,
    valuePerAvios,
    profitMargin,
    totalCost,
    recommendation,
    remainingAvios: userAviosBalance ? userAviosBalance - option.avios : undefined,
  };
}

/**
 * Calculates results for all options and marks the optimal one (lowest total cost among viable options).
 *
 * @param input - Cash price, number of people, options, and earning cost.
 * @returns Results sorted by total cost ascending; one result has isOptimal true.
 */
export function calculateAllOptions(input: CalculationInput): CalculationResult[] {
  const results = input.options.map(option =>
    calculateOptionValue(option, input.cashPrice, input.earningCost)
  );
  
  // Find optimal: lowest total cost among options with positive profit margin
  const viableOptions = results.filter(r => r.profitMargin >= 0);
  
  if (viableOptions.length > 0) {
    const optimal = viableOptions.reduce((best, current) =>
      current.totalCost < best.totalCost ? current : best
    );
    optimal.isOptimal = true;
  }
  
  // Sort by total cost (ascending)
  return results.sort((a, b) => a.totalCost - b.totalCost);
}

/**
 * Formats a number as GBP currency (e.g. "£123.40").
 * @param amount - Amount in pounds.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats Avios with thousands separator (e.g. "43,000").
 */
export function formatAvios(avios: number): string {
  return new Intl.NumberFormat('en-GB').format(avios);
}

/**
 * Formats a percentage with optional + for non-negative (e.g. "+136.0%" or "-10.0%").
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * Formats value per Avios in pence (e.g. "1.58p").
 */
export function formatValuePerAvios(pence: number): string {
  return `${pence.toFixed(2)}p`;
}
