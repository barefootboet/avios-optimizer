import { UserProfile, CalculationHistory } from './types';
import { userProfileSchema, calculationHistorySchema } from './validation';

const PROFILE_KEY = 'avios-optimizer-profile';
const HISTORY_KEY = 'avios-optimizer-history';

export const storage = {
  /** Persist user profile to localStorage. */
  saveProfile(profile: UserProfile): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
  },

  /** Load and validate user profile from localStorage. Returns null if missing or invalid. */
  getProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data) as unknown;
      const result = userProfileSchema.safeParse(parsed);
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  },

  /** Append a calculation to history and keep last 20. */
  saveCalculation(calculation: CalculationHistory): void {
    if (typeof window === 'undefined') return;
    const history = this.getHistory();
    history.unshift(calculation);
    const trimmed = history.slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  },

  /** Load and validate calculation history. Returns [] if missing or invalid. */
  getHistory(): CalculationHistory[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data) as unknown;
      if (!Array.isArray(parsed)) return [];
      const valid: CalculationHistory[] = [];
      for (const item of parsed) {
        const result = calculationHistorySchema.safeParse(item);
        if (result.success) valid.push(result.data);
      }
      return valid;
    } catch {
      return [];
    }
  },
  
  clearHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_KEY);
    }
  },
};
