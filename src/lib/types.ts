export type CardType = 
  | 'premium-plus' 
  | 'free' 
  | 'ba-visa-us'
  | 'flying-blue'
  | 'flying-bronze'
  | 'flying-silver'
  | 'flying-gold'
  | 'amex-transfer'
  | 'chase-transfer'
  | 'capital-one-transfer'
  | 'custom';

export type CostCalculationMode = 'simple' | 'average' | 'portfolio';

export interface CardPreset {
  id: CardType;
  name: string;
  category?: string;
  earningRate: number;
  earningCost: number;
  annualFee: number;
  description: string;
}

export interface AviosSource {
  id: string;
  methodId: CardType;
  methodName: string;
  amount: number;
  earningCost: number;
  earnedDate?: Date;
}

export interface UserProfile {
  cardType: CardType;
  earningRate: number;
  earningCost: number;
  costCalculationMode: CostCalculationMode;
  customAverageCost?: number;
  aviosSources: AviosSource[];
  aviosBalance?: number;
  customEarningRate?: number;
}

export interface AviosOption {
  id: string;
  avios: number;
  cash: number;
}

export interface CalculationInput {
  cashPrice: number;
  numberOfPeople: number;
  options: AviosOption[];
  earningCost: number;
}

export interface CalculationResult {
  option: AviosOption;
  cashSaved: number;
  valuePerAvios: number;
  profitMargin: number;
  totalCost: number;
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
