import { AviosOption, CalculationInput, CalculationResult } from './types';
import { RECOMMENDATION_THRESHOLDS } from './constants';

/**
 * Calculates value metrics for a single Avios option.
 *
 * Opportunity-cost model: earningCost represents the pence foregone per Avios earned
 * by using a BA card instead of a 1% cashback card. profitMargin measures how much
 * better (or worse) the redemption value is vs that earning cost.
 * See constants.ts for a full explanation of the model.
 *
 * @param option - The Avios + cash option (avios count and cash surcharge in pounds).
 * @param cashPrice - Total cash price for the trip (pounds).
 * @param earningCost - Cost in pence to earn 1 Avios (e.g. 0.6667 for Premium Plus).
 * @param numberOfPeople - Number of travellers; used to compute perPersonTotalCost.
 * @param userAviosBalance - Optional current balance; used for remainingAvios.
 * @returns Result with cashSaved, valuePerAvios (pence), profitMargin (%),
 *          totalCost (pounds), perPersonTotalCost (pounds), recommendation, remainingAvios.
 *
 * @example
 * Cash price £850, option 43,000 Avios + £169.40, earningCost 0.6667p:
 * - cashSaved = 680.60, valuePerAvios ≈ 1.58p, profitMargin ≈ 137%, totalCost ≈ 456.68
 */
export function calculateOptionValue(
  option: AviosOption,
  cashPrice: number,
  earningCost: number,
  numberOfPeople: number = 1,
  userAviosBalance?: number
): CalculationResult {
  const safeEarningCost = earningCost > 0 && Number.isFinite(earningCost) ? earningCost : 0.6667;
  const safeAvios = option.avios > 0 && Number.isFinite(option.avios) ? option.avios : 1;
  const safePeople = numberOfPeople >= 1 && Number.isFinite(numberOfPeople)
    ? Math.round(numberOfPeople)
    : 1;

  const cashSaved = cashPrice - option.cash;
  const valuePerAvios = safeAvios > 0 ? (cashSaved / safeAvios) * 100 : 0;
  const profitMargin = safeEarningCost > 0 ? ((valuePerAvios / safeEarningCost) - 1) * 100 : 0;
  const totalCost = option.cash + (option.avios * safeEarningCost / 100);
  const perPersonTotalCost = safePeople > 1 ? totalCost / safePeople : undefined;

  // Determine recommendation level using shared thresholds (see constants.ts)
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
    perPersonTotalCost,
    recommendation,
    remainingAvios: userAviosBalance !== undefined ? userAviosBalance - option.avios : undefined,
  };
}

/**
 * Calculates results for all options and marks the optimal or least-bad one.
 *
 * - Optimal: lowest total cost among options with profitMargin >= 0 (viable options).
 * - Least bad: if no options are viable, the option with the lowest total cost is
 *   marked isLeastBad=true to guide users who should consider paying cash instead.
 *
 * @param input - Cash price, number of people, options, earning cost, and optional aviosBalance.
 * @returns Results sorted by total cost ascending; one result has isOptimal or isLeastBad true.
 */
export function calculateAllOptions(input: CalculationInput): CalculationResult[] {
  const results = input.options.map(option =>
    calculateOptionValue(
      option,
      input.cashPrice,
      input.earningCost,
      input.numberOfPeople,
      input.aviosBalance,
    )
  );

  // Sort first so we can do stable immutable marking
  const sorted = [...results].sort((a, b) => a.totalCost - b.totalCost);

  // Find optimal: lowest total cost among options with non-negative profit margin
  const viableResults = sorted.filter(r => r.profitMargin >= 0);

  if (viableResults.length > 0) {
    const optimalResult = viableResults[0]; // already sorted ascending
    return sorted.map(r => ({ ...r, isOptimal: r === optimalResult }));
  }

  // All options are poor — mark least bad (first in sorted order) for guidance
  return sorted.map((r, i) => ({ ...r, isLeastBad: i === 0 }));
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
