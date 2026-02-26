import { z } from 'zod';

const cardTypeSchema = z.enum(['premium-plus', 'free', 'ba-visa-us', 'flying-blue', 'flying-bronze', 'flying-silver', 'flying-gold', 'amex-transfer', 'chase-transfer', 'capital-one-transfer', 'custom']);

const aviosSourceSchema = z.object({
  id: z.string(),
  methodId: cardTypeSchema,
  methodName: z.string(),
  amount: z.number(),
  earningCost: z.number(),
  earnedDate: z.union([z.date(), z.string().transform((s) => new Date(s))]).optional(),
});

export const userProfileSchema = z.object({
  cardType: cardTypeSchema,
  earningRate: z.number().finite().positive(),
  earningCost: z.number().finite().positive(),
  costCalculationMode: z.enum(['simple', 'average', 'portfolio']),
  customAverageCost: z.number().optional(),
  aviosSources: z.array(aviosSourceSchema),
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
