import { z } from 'zod';

const cardTypeSchema = z.enum(['premium-plus', 'free', 'custom']);

export const userProfileSchema = z.object({
  cardType: cardTypeSchema,
  earningRate: z.number().finite().positive(),
  earningCost: z.number().finite().positive(),
  aviosBalance: z.number().finite().nonnegative().optional(),
  customEarningRate: z.number().finite().positive().optional(),
});

export const aviosOptionSchema = z.object({
  id: z.string(),
  avios: z.number().finite().nonnegative(),
  cash: z.number().finite().nonnegative(),
});

export const calculationInputSchema = z.object({
  cashPrice: z.number().finite().nonnegative(),
  numberOfPeople: z.number().int().positive(),
  options: z.array(aviosOptionSchema),
  earningCost: z.number().finite().positive(),
});

const recommendationSchema = z.enum(['excellent', 'good', 'ok', 'poor']);

export const calculationResultSchema = z.object({
  option: aviosOptionSchema,
  cashSaved: z.number().finite(),
  valuePerAvios: z.number().finite(),
  profitMargin: z.number().finite(),
  totalCost: z.number().finite().nonnegative(),
  recommendation: recommendationSchema,
  remainingAvios: z.number().finite().optional(),
  isOptimal: z.boolean().optional(),
});

export const calculationHistorySchema = z.object({
  id: z.string(),
  timestamp: z.number().finite().positive(),
  input: calculationInputSchema,
  results: z.array(calculationResultSchema),
  profile: userProfileSchema,
});

export type UserProfileParsed = z.infer<typeof userProfileSchema>;
export type CalculationHistoryParsed = z.infer<typeof calculationHistorySchema>;
