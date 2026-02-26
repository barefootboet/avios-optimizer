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
  const baseOption: AviosOption = { id: '1', avios: 43000, cash: 169.4 };
  const cashPrice = 850;
  const earningCost = 0.67;

  it('computes cash saved correctly', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    expect(result.cashSaved).toBeCloseTo(680.6, 2);
  });

  it('computes value per Avios in pence correctly', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    expect(result.valuePerAvios).toBeCloseTo(1.58, 2);
  });

  it('computes profit margin correctly (approx +136%)', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    expect(result.profitMargin).toBeGreaterThanOrEqual(135);
    expect(result.profitMargin).toBeLessThanOrEqual(137);
  });

  it('computes total cost correctly', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    // totalCost = option.cash + (option.avios * earningCost / 100)
    expect(result.totalCost).toBeCloseTo(457.5, 1);
  });

  it('returns good or excellent recommendation for high profit margin', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost);
    expect(['excellent', 'good']).toContain(result.recommendation);
  });

  it('handles zero avios without Infinity/NaN', () => {
    const option: AviosOption = { id: 'z', avios: 0, cash: 100 };
    const result = calculateOptionValue(option, 500, 0.67);
    expect(Number.isFinite(result.valuePerAvios)).toBe(true);
    expect(Number.isFinite(result.profitMargin)).toBe(true);
    expect(Number.isFinite(result.totalCost)).toBe(true);
  });

  it('handles invalid earning cost with safe default', () => {
    const result = calculateOptionValue(baseOption, cashPrice, 0);
    expect(Number.isFinite(result.profitMargin)).toBe(true);
    expect(Number.isFinite(result.totalCost)).toBe(true);
  });

  it('computes remainingAvios when userAviosBalance provided', () => {
    const result = calculateOptionValue(baseOption, cashPrice, earningCost, 50000);
    expect(result.remainingAvios).toBe(7000);
  });
});

describe('calculateAllOptions', () => {
  const input: CalculationInput = {
    cashPrice: 850,
    numberOfPeople: 2,
    earningCost: 0.67,
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

  it('marks optimal as lowest total cost among viable options', () => {
    const results = calculateAllOptions(input);
    const optimal = results.find((r) => r.isOptimal);
    expect(optimal).toBeDefined();
    const costs = results.map((r) => r.totalCost);
    const minCost = Math.min(...costs);
    expect(optimal?.totalCost).toBe(minCost);
  });

  it('sorts results by total cost ascending', () => {
    const results = calculateAllOptions(input);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].totalCost).toBeGreaterThanOrEqual(results[i - 1].totalCost);
    }
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
