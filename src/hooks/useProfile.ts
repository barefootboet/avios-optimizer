'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserProfile, CardType, AviosSource, CostCalculationMode } from '@/lib/types';
import { EARNING_METHODS } from '@/lib/constants';
import { storage } from '@/lib/storage';
import { calculateBlendedCost, getEffectiveEarningCost } from '@/lib/costCalculations';

export function useProfile() {
  const defaultMethod = EARNING_METHODS[0];
  const [profile, setProfile] = useState<UserProfile>({
    cardType: defaultMethod.id,
    earningRate: defaultMethod.earningRate,
    earningCost: defaultMethod.earningCost,
    costCalculationMode: 'simple',
    aviosSources: [],
  });

  // Load from localStorage after mount
  useEffect(() => {
    const saved = storage.getProfile();
    if (saved) {
      setProfile(saved);
    }
  }, []);

  // Calculate effective earning cost based on mode
  const effectiveEarningCost = useMemo(() => {
    return getEffectiveEarningCost(
      profile.costCalculationMode,
      profile.earningCost,
      profile.customAverageCost,
      profile.aviosSources
    );
  }, [profile]);
  
  const updateCardType = (cardType: CardType) => {
    const method = EARNING_METHODS.find(p => p.id === cardType);
    if (!method) return;
    
    const newProfile: UserProfile = {
      ...profile,
      cardType,
      earningRate: method.earningRate,
      earningCost: method.earningCost,
    };
    
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };
  
  const updateCostCalculationMode = (mode: CostCalculationMode) => {
    const newProfile: UserProfile = {
      ...profile,
      costCalculationMode: mode,
    };
    
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };
  
  const updateCustomAverageCost = (cost: number) => {
    const newProfile: UserProfile = {
      ...profile,
      customAverageCost: cost,
    };
    
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };
  
  const addAviosSource = (methodId: CardType, amount: number) => {
    const method = EARNING_METHODS.find(m => m.id === methodId);
    if (!method) return;
    
    const newSource: AviosSource = {
      id: crypto.randomUUID(),
      methodId,
      methodName: method.name,
      amount,
      earningCost: method.earningCost,
      earnedDate: new Date(),
    };
    
    const newProfile: UserProfile = {
      ...profile,
      aviosSources: [...profile.aviosSources, newSource],
    };
    
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };
  
  const removeAviosSource = (id: string) => {
    const newProfile: UserProfile = {
      ...profile,
      aviosSources: profile.aviosSources.filter(s => s.id !== id),
    };
    
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };
  
  const updateAviosSource = (id: string, amount: number) => {
    const newProfile: UserProfile = {
      ...profile,
      aviosSources: profile.aviosSources.map(s =>
        s.id === id ? { ...s, amount } : s
      ),
    };
    
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };
  
  const updateCustomEarningRate = (rate: number) => {
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
    effectiveEarningCost,
    updateCardType,
    updateCostCalculationMode,
    updateCustomAverageCost,
    updateCustomEarningRate,
    updateAviosBalance,
    addAviosSource,
    removeAviosSource,
    updateAviosSource,
  };
}
