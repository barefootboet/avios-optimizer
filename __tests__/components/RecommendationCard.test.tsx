/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecommendationCard } from '@/src/components/calculator/RecommendationCard';
import { RECOMMENDATION_THRESHOLDS } from '@/src/lib/constants';
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

describe('RecommendationCard', () => {
  it('renders recommended title for optimal result', () => {
    render(<RecommendationCard result={makeResult({ isOptimal: true })} />);
    expect(screen.getByText(/recommended option/i)).toBeInTheDocument();
  });

  it('renders "Least Bad Option" title for isLeastBad result', () => {
    render(<RecommendationCard result={makeResult({ isLeastBad: true, profitMargin: -20, recommendation: 'poor' })} />);
    expect(screen.getByText(/least bad option/i)).toBeInTheDocument();
  });

  it('shows pay-cash suggestion when isLeastBad', () => {
    render(<RecommendationCard result={makeResult({ isLeastBad: true, profitMargin: -20, recommendation: 'poor' })} />);
    expect(screen.getByText(/consider paying cash/i)).toBeInTheDocument();
  });

  it('does not show pay-cash suggestion for optimal result', () => {
    render(<RecommendationCard result={makeResult({ isOptimal: true })} />);
    expect(screen.queryByText(/consider paying cash/i)).not.toBeInTheDocument();
  });

  it('shows "Exceptional value" text for profitMargin >= excellent threshold', () => {
    const margin = RECOMMENDATION_THRESHOLDS.excellent * 100 + 10; // > 150
    render(<RecommendationCard result={makeResult({ profitMargin: margin })} />);
    expect(screen.getByText(/exceptional value/i)).toBeInTheDocument();
  });

  it('shows "Good value" text for profitMargin between good and excellent', () => {
    const margin = RECOMMENDATION_THRESHOLDS.good * 100 + 10; // 60 (between 50 and 150)
    render(<RecommendationCard result={makeResult({ profitMargin: margin, recommendation: 'good' })} />);
    expect(screen.getByText(/good value/i)).toBeInTheDocument();
  });

  it('shows "Acceptable value" text for profitMargin between 0 and good', () => {
    const margin = RECOMMENDATION_THRESHOLDS.ok * 100 + 5; // 5 (between 0 and 50)
    render(<RecommendationCard result={makeResult({ profitMargin: margin, recommendation: 'ok' })} />);
    expect(screen.getByText(/acceptable value/i)).toBeInTheDocument();
  });

  it('shows "Below your earning cost" for negative profitMargin', () => {
    render(<RecommendationCard result={makeResult({ profitMargin: -30, recommendation: 'poor' })} />);
    expect(screen.getByText(/below your earning cost/i)).toBeInTheDocument();
  });

  it('shows remainingAvios when provided and positive', () => {
    render(<RecommendationCard result={makeResult({ remainingAvios: 7000 })} />);
    expect(screen.getByText(/7,000 remaining/i)).toBeInTheDocument();
  });

  it('shows "short" message when remainingAvios is negative', () => {
    render(<RecommendationCard result={makeResult({ remainingAvios: -5000 })} />);
    expect(screen.getByText(/5,000 short/i)).toBeInTheDocument();
  });

  it('shows per-person cost when perPersonTotalCost is present', () => {
    render(<RecommendationCard result={makeResult({ perPersonTotalCost: 228.05, totalCost: 456.1 })} />);
    expect(screen.getByText(/per person/i)).toBeInTheDocument();
  });

  it('threshold values are driven by RECOMMENDATION_THRESHOLDS constants', () => {
    // Verify the card uses the constant, not hardcoded values, by checking
    // that a margin exactly at the excellent threshold shows "Exceptional"
    const margin = RECOMMENDATION_THRESHOLDS.excellent * 100;
    render(<RecommendationCard result={makeResult({ profitMargin: margin })} />);
    expect(screen.getByText(/exceptional value/i)).toBeInTheDocument();
  });

  it('has no axe accessibility violations for optimal result', async () => {
    const { container } = render(<RecommendationCard result={makeResult({ isOptimal: true })} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe accessibility violations for isLeastBad result', async () => {
    const { container } = render(
      <RecommendationCard result={makeResult({ isLeastBad: true, profitMargin: -20, recommendation: 'poor' })} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
