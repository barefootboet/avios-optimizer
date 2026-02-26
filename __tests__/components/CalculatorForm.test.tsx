/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CalculatorForm } from '@/src/components/calculator/CalculatorForm';
import type { AviosOption } from '@/src/lib/types';

expect.extend(toHaveNoViolations);

const noop = () => undefined;

function renderForm(overrides: Partial<Parameters<typeof CalculatorForm>[0]> = {}) {
  const props = {
    cashPrice: 0,
    numberOfPeople: 1,
    options: [] as AviosOption[],
    onCashPriceChange: noop,
    onNumberOfPeopleChange: noop,
    onAddOption: noop,
    onRemoveOption: noop,
    onUpdateOption: noop,
    onCalculate: noop,
    ...overrides,
  };
  return render(<CalculatorForm {...props} />);
}

describe('CalculatorForm', () => {
  it('renders without crashing', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /calculate best value/i })).toBeInTheDocument();
  });

  it('Calculate button is disabled when cashPrice is 0 and no options', () => {
    renderForm({ cashPrice: 0, options: [] });
    expect(screen.getByRole('button', { name: /calculate best value/i })).toBeDisabled();
  });

  it('Calculate button is disabled when cashPrice > 0 but no options and no pending input', () => {
    renderForm({ cashPrice: 850, options: [] });
    expect(screen.getByRole('button', { name: /calculate best value/i })).toBeDisabled();
  });

  it('Calculate button is enabled when cashPrice > 0 and options exist', () => {
    const option: AviosOption = { id: '1', avios: 43000, cash: 169.4 };
    renderForm({ cashPrice: 850, options: [option] });
    expect(screen.getByRole('button', { name: /calculate best value/i })).not.toBeDisabled();
  });

  it('calls onRemoveOption with correct id when remove button clicked', async () => {
    const onRemoveOption = jest.fn();
    const option: AviosOption = { id: 'abc-123', avios: 43000, cash: 169.4 };
    renderForm({ options: [option], onRemoveOption });

    const removeBtn = screen.getByRole('button', { name: /remove option 1/i });
    await userEvent.click(removeBtn);

    expect(onRemoveOption).toHaveBeenCalledWith('abc-123');
  });

  it('existing option inputs have accessible labels', () => {
    const option: AviosOption = { id: '1', avios: 43000, cash: 169.4 };
    renderForm({ options: [option] });

    expect(screen.getByRole('spinbutton', { name: /avios for option 1/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /cash surcharge for option 1/i })).toBeInTheDocument();
  });

  it('new option row inputs have accessible labels', () => {
    renderForm();
    expect(screen.getByRole('spinbutton', { name: /avios for new option/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /cash surcharge for new option/i })).toBeInTheDocument();
  });

  it('Add button has accessible name', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /add avios option/i })).toBeInTheDocument();
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderForm();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
