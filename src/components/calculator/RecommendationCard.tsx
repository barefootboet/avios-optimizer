'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculationResult } from '@/lib/types';
import { formatCurrency, formatAvios, formatPercentage, formatValuePerAvios } from '@/lib/calculations';
import { CheckCircle2 } from 'lucide-react';

interface RecommendationCardProps {
  result: CalculationResult;
}

export function RecommendationCard({ result }: RecommendationCardProps) {
  const getExplanation = () => {
    if (result.profitMargin >= 150) {
      return `Exceptional value! You're getting ${formatPercentage(result.profitMargin)} more value than your earning cost. This is an excellent redemption.`;
    } else if (result.profitMargin >= 50) {
      return `Good value at ${formatPercentage(result.profitMargin)} profit margin. This redemption is worth making.`;
    } else if (result.profitMargin >= 0) {
      return `Acceptable value with ${formatPercentage(result.profitMargin)} profit. You're getting slightly more value than your earning cost.`;
    } else {
      return `Below your earning cost. You're getting ${formatPercentage(result.profitMargin)} less value than what it cost you to earn these Avios. Consider paying cash instead.`;
    }
  };
  
  return (
    <Card className="border-green-500 border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <CardTitle className="text-green-600">Recommended Option</CardTitle>
        </div>
        <CardDescription>
          Best balance of Avios efficiency and cash savings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Avios Required</p>
            <p className="text-2xl font-bold">{formatAvios(result.option.avios)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cash Required</p>
            <p className="text-2xl font-bold">{formatCurrency(result.option.cash)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Value per Avios</p>
            <p className="text-2xl font-bold text-green-600">
              {formatValuePerAvios(result.valuePerAvios)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profit Margin</p>
            <p className="text-2xl font-bold text-green-600">
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
            Cash paid + opportunity cost of Avios used
          </p>
          <p className="text-xl font-bold">{formatCurrency(result.totalCost)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
