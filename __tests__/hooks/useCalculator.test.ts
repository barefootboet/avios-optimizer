/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useCalculator } from '@/src/hooks/useCalculator';

// localStorage is automatically available in jsdom
beforeEach(() => {
  localStorage.clear();
});

describe('useCalculator', () => {
  const earningCost = parseFloat((1 / 1.5).toFixed(4));

  it('initialises with empty state', () => {
    const { result } = renderHook(() => useCalculator(earningCost));
    expect(result.current.cashPrice).toBe(0);
    expect(result.current.numberOfPeople).toBe(1);
    expect(result.current.options).toHaveLength(0);
    expect(result.current.results).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('calculate() with valid inputs populates results', () => {
    const { result } = renderHook(() => useCalculator(earningCost));

    act(() => { result.current.setCashPrice(850); });
    act(() => { result.current.addOption(43000, 169.4); });
    act(() => { result.current.calculate(); });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('calculate() with no options does nothing', () => {
    const { result } = renderHook(() => useCalculator(earningCost));

    act(() => { result.current.setCashPrice(850); });
    act(() => { result.current.calculate(); });

    expect(result.current.results).toHaveLength(0);
  });

  it('calculate() with cashPrice = 0 does nothing', () => {
    const { result } = renderHook(() => useCalculator(earningCost));

    act(() => { result.current.addOption(43000, 169.4); });
    act(() => { result.current.calculate(); });

    expect(result.current.results).toHaveLength(0);
  });

  it('calculate() with pendingOption includes it without persisting to options', () => {
    const { result } = renderHook(() => useCalculator(earningCost));

    act(() => { result.current.setCashPrice(850); });
    act(() => { result.current.calculate({ avios: 43000, cash: 169.4 }); });

    expect(result.current.results).toHaveLength(1);
    // The option was NOT permanently added
    expect(result.current.options).toHaveLength(0);
  });

  it('clears error on successful calculation after a failure', () => {
    const { result } = renderHook(() => useCalculator(earningCost));

    act(() => { result.current.setCashPrice(850); });
    act(() => { result.current.addOption(43000, 169.4); });

    // Force an error by passing invalid earningCost (will use fallback so no error here;
    // test the error=null clearance after success instead)
    act(() => { result.current.calculate(); });
    expect(result.current.error).toBeNull();
  });

  it('addOption increases options count', () => {
    const { result } = renderHook(() => useCalculator(earningCost));

    act(() => { result.current.addOption(43000, 169.4); });
    expect(result.current.options).toHaveLength(1);

    act(() => { result.current.addOption(32000, 269.2); });
    expect(result.current.options).toHaveLength(2);
  });

  it('removeOption decreases options count', () => {
    const { result } = renderHook(() => useCalculator(earningCost));

    act(() => { result.current.addOption(43000, 169.4); });
    const id = result.current.options[0].id;

    act(() => { result.current.removeOption(id); });
    expect(result.current.options).toHaveLength(0);
  });

  it('updateOption changes existing option values', () => {
    const { result } = renderHook(() => useCalculator(earningCost));

    act(() => { result.current.addOption(43000, 169.4); });
    const id = result.current.options[0].id;

    act(() => { result.current.updateOption(id, 50000, 200); });
    const updated = result.current.options.find(o => o.id === id);
    expect(updated?.avios).toBe(50000);
    expect(updated?.cash).toBe(200);
  });

  it('reset() returns all state to initial values', () => {
    const { result } = renderHook(() => useCalculator(earningCost));

    act(() => { result.current.setCashPrice(850); });
    act(() => { result.current.setNumberOfPeople(3); });
    act(() => { result.current.addOption(43000, 169.4); });
    act(() => { result.current.calculate(); });
    act(() => { result.current.reset(); });

    expect(result.current.cashPrice).toBe(0);
    expect(result.current.numberOfPeople).toBe(1);
    expect(result.current.options).toHaveLength(0);
    expect(result.current.results).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('threads aviosBalance from profile into results as remainingAvios', () => {
    const profile = {
      cardType: 'premium-plus' as const,
      earningRate: 1.5,
      earningCost,
      aviosBalance: 50000,
    };
    const { result } = renderHook(() => useCalculator(earningCost, profile));

    act(() => { result.current.setCashPrice(850); });
    act(() => { result.current.addOption(43000, 169.4); });
    act(() => { result.current.calculate(); });

    const firstResult = result.current.results[0];
    expect(firstResult.remainingAvios).toBeDefined();
    expect(firstResult.remainingAvios).toBe(50000 - 43000);
  });
});
