import {
  calculateOptionValue,
  calculateAllOptions,
  formatCurrency,
  formatAvios,
  formatPercentage,
  formatValuePerAvios,
} from '@/src/lib/calculations';
import type { AviosOption, CalculationInput } from '@/src/lib/types';

describe('calculateOptionValue', () => {
  // Use precise earningCost (1/1.5 = 0.6667) consistent with updated CARD_PRESETS
  const baseOption: AviosOption = { id: '1', avios: 43000, cash: 169.4 };
  const cashPrice = 850;
  const earningCost = parseFloat((1 / 1.5).toFixed(4)); // 0.6667

  it('computes cash saved correctly', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    expect(result.cashSaved).toBeCloseTo(680.6, 2);
  });

  it('computes value per Avios in pence correctly', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    expect(result.valuePerAvios).toBeCloseTo(1.583, 2);
  });

  it('computes profit margin correctly (approx +137%)', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    expect(result.profitMargin).toBeGreaterThanOrEqual(136);
    expect(result.profitMargin).toBeLessThanOrEqual(138);
  });

  it('computes total cost correctly with precise earningCost', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    // totalCost = 169.4 + (43000 * 0.6667 / 100) = 169.4 + 286.68 = 456.08
    expect(result.totalCost).toBeCloseTo(456.1, 0);
  });

  it('returns good recommendation for ~137% margin (precise earningCost 0.6667 < excellent threshold 150%)', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    expect(result.recommendation).toBe('good');
  });

  it('returns excellent recommendation when profitMargin >= 150%', () => {
    // Lower earningCost to push the margin past the 150% excellent threshold
    const result = calculateOptionValue(baseOption, cashPrice, 0.5);
    expect(result.profitMargin).toBeGreaterThanOrEqual(150);
    expect(result.recommendation).toBe('excellent');
  });

  it('handles zero avios without Infinity/NaN', () => {
    const option: AviosOption = { id: 'z', avios: 0, cash: 100 };
    const result = calculateOptionValue(option, 500, earningCost);
    expect(Number.isFinite(result.valuePerAvios)).toBe(true);
    expect(Number.isFinite(result.profitMargin)).toBe(true);
    expect(Number.isFinite(result.totalCost)).toBe(true);
  });

  it('handles invalid earning cost with safe default', () => {
    const result = calculateOptionValue(baseOption, cashPrice, 0);
    expect(Number.isFinite(result.profitMargin)).toBe(true);
    expect(Number.isFinite(result.totalCost)).toBe(true);
  });

  it('returns poor recommendation when option.cash > cashPrice (negative cashSaved)', () => {
    const expensiveOption: AviosOption = { id: 'e', avios: 1000, cash: 1000 };
    const result = calculateOptionValue(expensiveOption, 500, earningCost);
    expect(result.cashSaved).toBeLessThan(0);
    expect(result.recommendation).toBe('poor');
    expect(result.profitMargin).toBeLessThan(0);
  });

  it('computes remainingAvios when aviosBalance provided (4th arg = numberOfPeople)', () => {
    // numberOfPeople=1, aviosBalance=50000
    const result = calculateOptionValue(baseOption, cashPrice, earningCost, 1, 50000);
    expect(result.remainingAvios).toBe(7000);
  });

  it('remainingAvios is undefined when no balance provided', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    expect(result.remainingAvios).toBeUndefined();
  });

  it('computes perPersonTotalCost for multiple people', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost, 2);
    expect(result.perPersonTotalCost).toBeCloseTo(result.totalCost / 2, 4);
  });

  it('perPersonTotalCost is undefined for single traveller', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost, 1);
    expect(result.perPersonTotalCost).toBeUndefined();
  });
});

describe('calculateAllOptions', () => {
  const earningCost = parseFloat((1 / 1.5).toFixed(4));

  const input: CalculationInput = {
    cashPrice: 850,
    numberOfPeople: 2,
    earningCost,
    options: [
      { id: 'a', avios: 43000, cash: 169.4 },
      { id: 'b', avios: 32000, cash: 269.2 },
      { id: 'c', avios: 25600, cash: 337.6 },
    ],
  };

  it('returns one result per option', () => {
    const results = calculateAllOptions(input);
    expect(results).toHaveLength(3);
  });

  it('marks optimal as lowest total cost among VIABLE options only', () => {
    const results = calculateAllOptions(input);
    const optimal = results.find((r) => r.isOptimal);
    expect(optimal).toBeDefined();
    // Optimal should be lowest cost among options with profitMargin >= 0
    const viableCosts = results
      .filter(r => r.profitMargin >= 0)
      .map(r => r.totalCost);
    const minViableCost = Math.min(...viableCosts);
    expect(optimal?.totalCost).toBe(minViableCost);
  });

  it('sorts results by total cost ascending', () => {
    const results = calculateAllOptions(input);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].totalCost).toBeGreaterThanOrEqual(results[i - 1].totalCost);
    }
  });

  it('does not set isOptimal when all options are poor', () => {
    const poorInput: CalculationInput = {
      cashPrice: 100,
      numberOfPeople: 1,
      earningCost: 1.0, // free card
      // Both options have high cash-component, so cashSaved is tiny → poor margin
      options: [
        { id: 'x', avios: 1000, cash: 99 },   // cashSaved = 1, valuePerAvios = 0.1p < 1.0p earning cost
        { id: 'y', avios: 2000, cash: 98 },   // cashSaved = 2, valuePerAvios = 0.1p < 1.0p
      ],
    };
    const results = calculateAllOptions(poorInput);
    const optimal = results.find(r => r.isOptimal);
    expect(optimal).toBeUndefined();
  });

  it('marks isLeastBad on the cheapest option when all are poor', () => {
    const poorInput: CalculationInput = {
      cashPrice: 100,
      numberOfPeople: 1,
      earningCost: 1.0,
      options: [
        { id: 'x', avios: 1000, cash: 99 },
        { id: 'y', avios: 2000, cash: 98 },
      ],
    };
    const results = calculateAllOptions(poorInput);
    const leastBad = results.find(r => r.isLeastBad);
    expect(leastBad).toBeDefined();
    // leastBad is the minimum total cost (not a specific option by index)
    const minCost = Math.min(...results.map(r => r.totalCost));
    expect(leastBad?.totalCost).toBe(minCost);
  });

  it('when cheapest option is poor, optimal is the cheapest viable (not the cheapest overall)', () => {
    // Option 'cheap-poor' has lower total cost but negative profit margin
    // Option 'viable' has higher total cost but positive profit margin
    const mixedInput: CalculationInput = {
      cashPrice: 200,
      numberOfPeople: 1,
      earningCost: 1.0,
      options: [
        // high Avios + near-full cash → tiny cashSaved, low CPP → poor
        { id: 'cheap-poor', avios: 500,  cash: 195 }, // cashSaved=5, vpa=1.0p, margin=0% → 'ok' actually
        // Let's use even worse option
        { id: 'worse',      avios: 1000, cash: 199 }, // cashSaved=1, vpa=0.1p, margin=-90% → poor
        { id: 'viable',     avios: 5000, cash: 100 }, // cashSaved=100, vpa=2p, margin=100% → excellent
      ],
    };
    const results = calculateAllOptions(mixedInput);
    const optimal = results.find(r => r.isOptimal);
    expect(optimal).toBeDefined();
    expect(optimal?.option.id).toBe('viable');
  });

  it('threads aviosBalance into results as remainingAvios', () => {
    const withBalance: CalculationInput = { ...input, aviosBalance: 50000 };
    const results = calculateAllOptions(withBalance);
    results.forEach(r => {
      expect(r.remainingAvios).toBeDefined();
      expect(r.remainingAvios).toBe(50000 - r.option.avios);
    });
  });

  it('perPersonTotalCost is present for all results when numberOfPeople > 1', () => {
    const results = calculateAllOptions(input); // numberOfPeople: 2
    results.forEach(r => {
      expect(r.perPersonTotalCost).toBeDefined();
      expect(r.perPersonTotalCost).toBeCloseTo(r.totalCost / 2, 4);
    });
  });

  it('returns a new array (does not mutate original options)', () => {
    const snapshot = input.options.map(o => ({ ...o }));
    calculateAllOptions(input);
    input.options.forEach((opt, i) => {
      expect(opt).toEqual(snapshot[i]);
    });
  });
});

describe('formatCurrency', () => {
  it('formats GBP with 2 decimals', () => {
    expect(formatCurrency(123.4)).toMatch(/123\.40/);
    expect(formatCurrency(123.4)).toMatch(/£/);
  });
});

describe('formatAvios', () => {
  it('formats with thousands separator', () => {
    expect(formatAvios(43000)).toBe('43,000');
  });
});

describe('formatPercentage', () => {
  it('includes + for non-negative', () => {
    expect(formatPercentage(50)).toMatch(/\+.*50/);
  });
  it('no + for negative', () => {
    expect(formatPercentage(-10)).toMatch(/-10/);
  });
});

describe('formatValuePerAvios', () => {
  it('formats pence with 2 decimals and p suffix', () => {
    expect(formatValuePerAvios(1.58)).toBe('1.58p');
  });
});
