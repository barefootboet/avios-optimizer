'use client';

import { useState } from 'react';
import { UserProfile, CardType } from '@/src/lib/types';
import { CARD_PRESETS } from '@/src/lib/constants';
import { storage } from '@/src/lib/storage';

/**
 * Hook for user profile (card type, earning rate, optional Avios balance).
 * Persists to localStorage; initial state from storage or default preset.
 *
 * @returns profile and updaters: updateCardType, updateCustomEarningRate, updateAviosBalance.
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    // Initialize from localStorage or default
    if (typeof window !== 'undefined') {
      const saved = storage.getProfile();
      if (saved) return saved;
    }
    
    const defaultPreset = CARD_PRESETS[0];
    return {
      cardType: defaultPreset.id,
      earningRate: defaultPreset.earningRate,
      earningCost: defaultPreset.earningCost,
    };
  });
  
  const updateCardType = (cardType: CardType) => {
    const preset = CARD_PRESETS.find(p => p.id === cardType);
    if (!preset) return;
    
    const newProfile: UserProfile = {
      ...profile,
      cardType,
      earningRate: preset.earningRate,
      earningCost: preset.earningCost,
    };
    
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };
  
  const updateCustomEarningRate = (rate: number) => {
    // earningCost = 1 / rate: pence foregone per Avios vs a 1% cashback baseline.
    // See constants.ts for a full explanation of the opportunity-cost model.
    const earningCost = 1 / rate;
    const newProfile: UserProfile = {
      ...profile,
      cardType: 'custom',
      earningRate: rate,
      earningCost,
      customEarningRate: rate,
    };
    
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };
  
  const updateAviosBalance = (balance: number | undefined) => {
    const newProfile: UserProfile = {
      ...profile,
      aviosBalance: balance,
    };
    
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };
  
  return {
    profile,
    updateCardType,
    updateCustomEarningRate,
    updateAviosBalance,
  };
}
