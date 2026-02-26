'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { CalculationResult } from '@/src/lib/types';
import { formatCurrency, formatAvios, formatPercentage, formatValuePerAvios } from '@/src/lib/calculations';
import { RECOMMENDATION_THRESHOLDS } from '@/src/lib/constants';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface RecommendationCardProps {
  result: CalculationResult;
}

export function RecommendationCard({ result }: RecommendationCardProps) {
  const { excellent, good, ok } = RECOMMENDATION_THRESHOLDS;
  const isLeastBad = result.isLeastBad === true;

  const getExplanation = () => {
    if (result.profitMargin >= excellent * 100) {
      return `Exceptional value! You're getting ${formatPercentage(result.profitMargin)} more value than your earning cost. This is an excellent redemption.`;
    } else if (result.profitMargin >= good * 100) {
      return `Good value at ${formatPercentage(result.profitMargin)} profit margin. This redemption is worth making.`;
    } else if (result.profitMargin >= ok * 100) {
      return `Acceptable value with ${formatPercentage(result.profitMargin)} profit. You're getting slightly more value than your earning cost.`;
    } else {
      return `Below your earning cost. You're getting ${formatPercentage(result.profitMargin)} less value than what it cost you to earn these Avios.`;
    }
  };

  const marginColour = result.profitMargin >= 0 ? 'text-green-600' : 'text-amber-700';

  return (
    <Card className={isLeastBad ? 'border-amber-500 border-2' : 'border-green-500 border-2'}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isLeastBad
            ? <AlertCircle className="h-5 w-5 text-amber-500" />
            : <CheckCircle2 className="h-5 w-5 text-green-500" />
          }
          <CardTitle className={isLeastBad ? 'text-amber-700' : 'text-green-600'}>
            {isLeastBad ? 'Least Bad Option' : 'Recommended Option'}
          </CardTitle>
        </div>
        <CardDescription>
          {isLeastBad
            ? 'All options are below your earning cost — see suggestion below'
            : 'Best balance of Avios efficiency and cash savings'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Avios Required</p>
            <p className="text-2xl font-bold">{formatAvios(result.option.avios)}</p>
            {result.remainingAvios !== undefined && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {result.remainingAvios >= 0
                  ? `${formatAvios(result.remainingAvios)} remaining`
                  : `${formatAvios(Math.abs(result.remainingAvios))} short`}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cash Required</p>
            <p className="text-2xl font-bold">{formatCurrency(result.option.cash)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Value per Avios</p>
            <p className={`text-2xl font-bold ${marginColour}`}>
              {formatValuePerAvios(result.valuePerAvios)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profit Margin</p>
            <p className={`text-2xl font-bold ${marginColour}`}>
              {formatPercentage(result.profitMargin)}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Why this option?</p>
          <p className="text-sm">{getExplanation()}</p>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-1">Total Cost</p>
          <p className="text-xs text-muted-foreground mb-2">
            Cash paid + opportunity cost of Avios used (vs 1% cashback baseline)
          </p>
          <p className="text-xl font-bold">{formatCurrency(result.totalCost)}</p>
          {result.perPersonTotalCost !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(result.perPersonTotalCost)} per person
            </p>
          )}
        </div>

        {isLeastBad && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Consider paying cash instead
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              The full cash price is{' '}
              <span className="font-semibold">
                {formatCurrency(result.cashSaved + result.option.cash)}
              </span>
              {result.perPersonTotalCost !== undefined && (
                <> ({formatCurrency((result.cashSaved + result.option.cash) / Math.round(result.totalCost / result.perPersonTotalCost))} per person)</>
              )}
              . All Avios options cost more than your earning rate — redeeming Avios here
              doesn&apos;t beat the cashback you gave up to earn them.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
