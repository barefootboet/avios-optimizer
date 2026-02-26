import { CardType, CardPreset } from './types';

export const EARNING_METHODS: CardPreset[] = [
  // Credit Cards
  {
    id: 'premium-plus' as CardType,
    name: 'BA Amex Premium Plus (Black)',
    category: 'Credit Cards',
    earningRate: 1.5,
    earningCost: 0.67,
    annualFee: 300,
    description: '1.5 Avios per £1 spent'
  },
  {
    id: 'free' as CardType,
    name: 'BA Amex Free (Blue)',
    category: 'Credit Cards',
    earningRate: 1.0,
    earningCost: 1.0,
    annualFee: 0,
    description: '1 Avios per £1 spent'
  },
  {
    id: 'ba-visa-us' as CardType,
    name: 'BA Visa Signature (US)',
    category: 'Credit Cards',
    earningRate: 1.0,
    earningCost: 1.0,
    annualFee: 95,
    description: '1-3 Avios per $1 spent'
  },
  
  // Flying - BA Status
  {
    id: 'flying-blue' as CardType,
    name: 'Flying - Blue Status',
    category: 'Flying British Airways',
    earningRate: 6.0,
    earningCost: 0.17,
    annualFee: 0,
    description: '6 Avios per £1 ticket price'
  },
  {
    id: 'flying-bronze' as CardType,
    name: 'Flying - Bronze Status',
    category: 'Flying British Airways',
    earningRate: 7.0,
    earningCost: 0.14,
    annualFee: 0,
    description: '7 Avios per £1 ticket price'
  },
  {
    id: 'flying-silver' as CardType,
    name: 'Flying - Silver Status',
    category: 'Flying British Airways',
    earningRate: 8.0,
    earningCost: 0.13,
    annualFee: 0,
    description: '8 Avios per £1 ticket price'
  },
  {
    id: 'flying-gold' as CardType,
    name: 'Flying - Gold Status',
    category: 'Flying British Airways',
    earningRate: 9.0,
    earningCost: 0.11,
    annualFee: 0,
    description: '9 Avios per £1 ticket price'
  },
  
  // Point Transfers
  {
    id: 'amex-transfer' as CardType,
    name: 'Amex Membership Rewards',
    category: 'Point Transfers',
    earningRate: 1.0,
    earningCost: 1.0,
    annualFee: 0,
    description: 'Transfer 1:1 to Avios'
  },
  {
    id: 'chase-transfer' as CardType,
    name: 'Chase Ultimate Rewards',
    category: 'Point Transfers',
    earningRate: 1.0,
    earningCost: 1.0,
    annualFee: 0,
    description: 'Transfer 1:1 to Avios'
  },
  {
    id: 'capital-one-transfer' as CardType,
    name: 'Capital One Miles',
    category: 'Point Transfers',
    earningRate: 1.0,
    earningCost: 1.0,
    annualFee: 0,
    description: 'Transfer 1:1 to Avios'
  },
  
  // Custom
  {
    id: 'custom' as CardType,
    name: 'Custom Earning Rate',
    category: 'Custom',
    earningRate: 1.0,
    earningCost: 1.0,
    annualFee: 0,
    description: 'Enter your own earning rate'
  }
];

// Keep old export for backward compatibility
export const CARD_PRESETS = EARNING_METHODS;

export const RECOMMENDATION_THRESHOLDS = {
  excellent: 1.5,
  good: 0.5,
  ok: 0.0,
};

// Helper function to group methods by category
export function getMethodsByCategory() {
  const categories = new Map<string, CardPreset[]>();
  
  EARNING_METHODS.forEach(method => {
    const category = method.category || 'Other';
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(method);
  });
  
  return categories;
}
