/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useProfile } from '@/src/hooks/useProfile';
import { CARD_PRESETS } from '@/src/lib/constants';

beforeEach(() => {
  localStorage.clear();
});

describe('useProfile', () => {
  it('initialises with Premium Plus preset by default', () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.profile.cardType).toBe('premium-plus');
    const preset = CARD_PRESETS.find(p => p.id === 'premium-plus')!;
    expect(result.current.profile.earningCost).toBe(preset.earningCost);
    expect(result.current.profile.earningRate).toBe(preset.earningRate);
  });

  it('updateCardType("free") sets earningCost = 1.0', () => {
    const { result } = renderHook(() => useProfile());
    act(() => { result.current.updateCardType('free'); });
    expect(result.current.profile.earningCost).toBe(1.0);
    expect(result.current.profile.cardType).toBe('free');
  });

  it('updateCardType("premium-plus") sets earningCost ≈ 0.6667', () => {
    const { result } = renderHook(() => useProfile());
    act(() => { result.current.updateCardType('premium-plus'); });
    expect(result.current.profile.earningCost).toBeCloseTo(0.6667, 4);
  });

  it('updateCustomEarningRate(2) derives earningCost = 0.5', () => {
    const { result } = renderHook(() => useProfile());
    act(() => { result.current.updateCustomEarningRate(2); });
    expect(result.current.profile.earningCost).toBeCloseTo(0.5, 4);
    expect(result.current.profile.cardType).toBe('custom');
  });

  it('updateCustomEarningRate(3) derives earningCost ≈ 0.3333', () => {
    const { result } = renderHook(() => useProfile());
    act(() => { result.current.updateCustomEarningRate(3); });
    expect(result.current.profile.earningCost).toBeCloseTo(0.3333, 4);
  });

  it('updateAviosBalance sets the balance', () => {
    const { result } = renderHook(() => useProfile());
    act(() => { result.current.updateAviosBalance(50000); });
    expect(result.current.profile.aviosBalance).toBe(50000);
  });

  it('updateAviosBalance(undefined) clears the balance', () => {
    const { result } = renderHook(() => useProfile());
    act(() => { result.current.updateAviosBalance(50000); });
    act(() => { result.current.updateAviosBalance(undefined); });
    expect(result.current.profile.aviosBalance).toBeUndefined();
  });

  it('persists profile to localStorage on update', () => {
    const { result } = renderHook(() => useProfile());
    act(() => { result.current.updateCardType('free'); });
    const stored = localStorage.getItem('avios-optimizer-profile');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.cardType).toBe('free');
  });

  it('restores profile from localStorage on mount', () => {
    // Set up a profile in localStorage first
    const savedProfile = {
      cardType: 'free',
      earningRate: 1.0,
      earningCost: 1.0,
      aviosBalance: 12345,
    };
    localStorage.setItem('avios-optimizer-profile', JSON.stringify(savedProfile));

    const { result } = renderHook(() => useProfile());
    expect(result.current.profile.cardType).toBe('free');
    expect(result.current.profile.aviosBalance).toBe(12345);
  });
});
