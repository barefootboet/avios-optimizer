import { CardPreset } from './types';

export const CARD_PRESETS: CardPreset[] = [
  {
    id: 'premium-plus',
    name: 'BA American Express Premium Plus',
    earningRate: 1.5,        // 1.5 Avios per £1
    earningCost: 0.67,       // £1 ÷ 1.5 = 0.67p per Avios
    annualFee: 300,
    description: 'Black card - 1.5 Avios per £1 spent'
  },
  {
    id: 'free',
    name: 'BA American Express (Free)',
    earningRate: 1.0,        // 1 Avios per £1
    earningCost: 1.0,        // £1 ÷ 1 = 1p per Avios
    annualFee: 0,
    description: 'Free card - 1 Avios per £1 spent'
  },
  {
    id: 'custom',
    name: 'Custom Earning Rate',
    earningRate: 1.0,
    earningCost: 1.0,
    annualFee: 0,
    description: 'Enter your own earning rate'
  }
];

export const RECOMMENDATION_THRESHOLDS = {
  excellent: 1.5,  // 150% profit margin
  good: 0.5,       // 50% profit margin
  ok: 0.0,         // Break-even or better
};
