/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ResultsTable } from '@/src/components/calculator/ResultsTable';
import type { CalculationResult, AviosOption } from '@/src/lib/types';

expect.extend(toHaveNoViolations);

function makeResult(overrides: Partial<CalculationResult> = {}): CalculationResult {
  const option: AviosOption = { id: '1', avios: 43000, cash: 169.4 };
  return {
    option,
    cashSaved: 680.6,
    valuePerAvios: 1.583,
    profitMargin: 137,
    totalCost: 456.1,
    recommendation: 'excellent',
    ...overrides,
  };
}

describe('ResultsTable', () => {
  it('returns null when results array is empty', () => {
    const { container } = render(<ResultsTable results={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a row for each result', () => {
    const results = [
      makeResult({ option: { id: '1', avios: 43000, cash: 169.4 } }),
      makeResult({ option: { id: '2', avios: 32000, cash: 269.2 } }),
    ];
    render(<ResultsTable results={results} />);
    expect(screen.getAllByRole('row').length).toBeGreaterThanOrEqual(3); // header + 2 data rows
  });

  it('shows "Best" badge for the optimal result', () => {
    const results = [makeResult({ isOptimal: true })];
    render(<ResultsTable results={results} />);
    expect(screen.getByText('Best')).toBeInTheDocument();
  });

  it('shows "Least bad" badge for the isLeastBad result', () => {
    const results = [makeResult({ isLeastBad: true, recommendation: 'poor', profitMargin: -20 })];
    render(<ResultsTable results={results} />);
    expect(screen.getByText('Least bad')).toBeInTheDocument();
  });

  it('highlights optimal row with green background class', () => {
    const results = [makeResult({ isOptimal: true })];
    const { container } = render(<ResultsTable results={results} />);
    const optimalRow = container.querySelector('.bg-green-50');
    expect(optimalRow).not.toBeNull();
  });

  it('shows Per Person column when perPersonTotalCost is present', () => {
    const results = [makeResult({ perPersonTotalCost: 228.05, option: { id: '1', avios: 43000, cash: 169.4 } })];
    render(<ResultsTable results={results} />);
    // Header and cell both match; at least one instance should exist
    expect(screen.getAllByText(/per person/i).length).toBeGreaterThanOrEqual(1);
  });

  it('does not show Per Person column when perPersonTotalCost is absent', () => {
    const results = [makeResult()]; // no perPersonTotalCost
    render(<ResultsTable results={results} />);
    expect(screen.queryByText(/per person/i)).not.toBeInTheDocument();
  });

  it('positive profit margin uses green text', () => {
    const results = [makeResult({ profitMargin: 50 })];
    const { container } = render(<ResultsTable results={results} />);
    expect(container.querySelector('.text-green-600')).not.toBeNull();
  });

  it('negative profit margin uses red text', () => {
    const results = [makeResult({ profitMargin: -10, recommendation: 'poor' })];
    const { container } = render(<ResultsTable results={results} />);
    expect(container.querySelector('.text-red-600')).not.toBeNull();
  });

  it('has no axe accessibility violations', async () => {
    const results = [
      makeResult({ option: { id: '1', avios: 43000, cash: 169.4 }, isOptimal: true }),
      makeResult({ option: { id: '2', avios: 32000, cash: 269.2 }, recommendation: 'good', profitMargin: 80 }),
    ];
    const { container } = render(<ResultsTable results={results} />);
    const axeResults = await axe(container);
    expect(axeResults).toHaveNoViolations();
  });
});
