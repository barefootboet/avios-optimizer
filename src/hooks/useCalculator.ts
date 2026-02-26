'use client';

import { useState, useRef, useCallback } from 'react';
import { AviosOption, CalculationInput, CalculationResult, UserProfile } from '@/lib/types';
import { calculateAllOptions } from '@/lib/calculations';
import { storage } from '@/lib/storage';

/**
 * Hook for Avios calculator state and actions.
 *
 * @param earningCost - Cost in pence to earn 1 Avios (from profile).
 * @param profile - Optional current profile; used when saving calculation history.
 * @returns State (cashPrice, numberOfPeople, options, results) and actions (setCashPrice, addOption, calculate, etc.).
 *          `calculate(pendingOption?)` can include the "new row" values without adding them to options.
 */
export function useCalculator(earningCost: number, profile?: UserProfile) {
  const [cashPrice, setCashPrice] = useState<number>(0);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [options, setOptions] = useState<AviosOption[]>([]);
  const [results, setResults] = useState<CalculationResult[]>([]);

  const stateRef = useRef<{ cashPrice: number; options: AviosOption[]; numberOfPeople: number }>({
    cashPrice: 0,
    options: [],
    numberOfPeople: 1,
  });
  stateRef.current = { cashPrice, options, numberOfPeople };

  const addOption = (avios: number, cash: number) => {
    const newOption: AviosOption = {
      id: crypto.randomUUID(),
      avios,
      cash,
    };
    setOptions((prev) => [...prev, newOption]);
  };

  const removeOption = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOption = (id: string, avios: number, cash: number) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, avios, cash } : o))
    );
  };

  const calculate = useCallback(
    (pendingOption?: { avios: number; cash: number }) => {
      const { cashPrice: price, options: opts, numberOfPeople: people } = stateRef.current;
      const cost = Number(earningCost);
      const validEarningCost = cost > 0 && Number.isFinite(cost) ? cost : 0.67;

      const optionsToUse = pendingOption
        ? [...opts, { id: 'pending', avios: pendingOption.avios, cash: pendingOption.cash }]
        : opts;

      if (price <= 0 || optionsToUse.length === 0) {
        return;
      }

      try {
        const input: CalculationInput = {
          cashPrice: price,
          numberOfPeople: people,
          options: optionsToUse,
          earningCost: validEarningCost,
        };

        const calculatedResults = calculateAllOptions(input);
        setResults([...calculatedResults]);

        if (typeof window !== 'undefined') {
          storage.saveCalculation({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            input,
            results: calculatedResults,
            profile: profile ?? {
              cardType: 'premium-plus',
              earningRate: 1 / validEarningCost,
              earningCost: validEarningCost,
              costCalculationMode: 'simple',
              aviosSources: [],
            },
          });
        }
      } catch (_) {
        setResults([]);
      }
    },
    [earningCost, profile]
  );
  
  const reset = () => {
    setCashPrice(0);
    setNumberOfPeople(1);
    setOptions([]);
    setResults([]);
  };
  
  return {
    cashPrice,
    setCashPrice,
    numberOfPeople,
    setNumberOfPeople,
    options,
    addOption,
    removeOption,
    updateOption,
    results,
    calculate,
    reset,
  };
}
