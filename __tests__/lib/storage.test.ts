/**
 * Storage tests (validation). Run in Node; localStorage is mocked or we test parse only.
 * We test the validation logic by importing the schemas and testing safeParse.
 */
import { userProfileSchema, calculationHistorySchema } from '@/src/lib/validation';

describe('userProfileSchema', () => {
  it('accepts valid profile', () => {
    const valid = {
      cardType: 'premium-plus',
      earningRate: 1.5,
      earningCost: 0.67,
    };
    expect(userProfileSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid cardType', () => {
    const invalid = {
      cardType: 'invalid',
      earningRate: 1.5,
      earningCost: 0.67,
    };
    expect(userProfileSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects missing required fields', () => {
    expect(userProfileSchema.safeParse({}).success).toBe(false);
    expect(userProfileSchema.safeParse({ cardType: 'free' }).success).toBe(false);
  });
});

describe('calculationHistorySchema', () => {
  it('accepts valid history item', () => {
    const valid = {
      id: 'x',
      timestamp: Date.now(),
      input: {
        cashPrice: 850,
        numberOfPeople: 2,
        options: [{ id: 'a', avios: 43000, cash: 169.4 }],
        earningCost: 0.67,
      },
      results: [],
      profile: {
        cardType: 'premium-plus',
        earningRate: 1.5,
        earningCost: 0.67,
      },
    };
    expect(calculationHistorySchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid structure', () => {
    expect(calculationHistorySchema.safeParse({ id: 'x' }).success).toBe(false);
    expect(calculationHistorySchema.safeParse(null).success).toBe(false);
  });
});
