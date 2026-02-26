export type CardType = 'premium-plus' | 'free' | 'custom';

export interface CardPreset {
  id: CardType;
  name: string;
  earningRate: number; // Avios per £1 spent
  earningCost: number; // Cost in pence to earn 1 Avios (= 1 / earningRate, see constants.ts)
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
  aviosBalance?: number;    // User's current Avios balance; used for remainingAvios in results
}

export interface CalculationResult {
  option: AviosOption;
  cashSaved: number;               // cashPrice - option.cash
  valuePerAvios: number;           // cashSaved / option.avios (in pence)
  profitMargin: number;            // (valuePerAvios / earningCost - 1) * 100
  totalCost: number;               // option.cash + (option.avios * earningCost / 100)
  perPersonTotalCost?: number;     // totalCost / numberOfPeople (present when numberOfPeople > 1)
  recommendation: 'excellent' | 'good' | 'ok' | 'poor';
  remainingAvios?: number;         // aviosBalance - option.avios (present when balance provided)
  isOptimal?: boolean;             // true for the lowest-total-cost viable option
  isLeastBad?: boolean;            // true when all options are poor; marks the best of a bad set
}

export interface CalculationHistory {
  id: string;
  timestamp: number;
  input: CalculationInput;
  results: CalculationResult[];
  profile: UserProfile;
}
