import { AviosSource } from './types';

/**
 * Calculate weighted average earning cost from portfolio
 */
export function calculateBlendedCost(sources: AviosSource[]): number {
  if (sources.length === 0) return 0;
  
  const totalAvios = sources.reduce((sum, s) => sum + s.amount, 0);
  if (totalAvios === 0) return 0;
  
  const weightedSum = sources.reduce((sum, s) => 
    sum + (s.amount * s.earningCost), 0
  );
  
  return weightedSum / totalAvios;
}

/**
 * Get total Avios from portfolio
 */
export function getTotalAviosFromSources(sources: AviosSource[]): number {
  return sources.reduce((sum, s) => sum + s.amount, 0);
}

/**
 * Get the effective earning cost based on calculation mode
 */
export function getEffectiveEarningCost(
  mode: 'simple' | 'average' | 'portfolio',
  currentMethodCost: number,
  customAverageCost: number | undefined,
  sources: AviosSource[]
): number {
  switch (mode) {
    case 'simple':
      return currentMethodCost;
    
    case 'average':
      return customAverageCost || currentMethodCost;
    
    case 'portfolio':
      const blended = calculateBlendedCost(sources);
      return blended > 0 ? blended : currentMethodCost;
    
    default:
      return currentMethodCost;
  }
}
