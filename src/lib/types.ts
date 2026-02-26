export type CardType = 'premium-plus' | 'free' | 'custom';

export interface CardPreset {
  id: CardType;
  name: string;
  earningRate: number; // Avios per £1 spent
  earningCost: number; // Cost in pence to earn 1 Avios
  annualFee: number;
  description: string;
}

export interface UserProfile {
  cardType: CardType;
  earningRate: number;      // e.g., 1.5 Avios per £1
  earningCost: number;      // e.g., 0.67p per Avios
  aviosBalance?: number;
  customEarningRate?: number;
}

export interface AviosOption {
  id: string;
  avios: number;
  cash: number;
}

export interface CalculationInput {
  cashPrice: number;        // Total cash price for all people
  numberOfPeople: number;
  options: AviosOption[];
  earningCost: number;
}

export interface CalculationResult {
  option: AviosOption;
  cashSaved: number;               // cashPrice - option.cash
  valuePerAvios: number;           // cashSaved / option.avios (in pence)
  profitMargin: number;            // (valuePerAvios / earningCost - 1) * 100
  totalCost: number;               // option.cash + (option.avios * earningCost / 100)
  recommendation: 'excellent' | 'good' | 'ok' | 'poor';
  remainingAvios?: number;
  isOptimal?: boolean;
}

export interface CalculationHistory {
  id: string;
  timestamp: number;
  input: CalculationInput;
  results: CalculationResult[];
  profile: UserProfile;
}
