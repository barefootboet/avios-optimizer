'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { EARNING_METHODS, getMethodsByCategory } from '@/lib/constants';
import { CardType, CostCalculationMode } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface SetupFormProps {
  cardType: CardType;
  customEarningRate?: number;
  aviosBalance?: number;
  costMode: CostCalculationMode;
  effectiveEarningCost: number;
  onCardTypeChange: (type: CardType) => void;
  onCustomEarningRateChange: (rate: number) => void;
  onAviosBalanceChange: (balance: number | undefined) => void;
}

export function SetupForm({
  cardType,
  customEarningRate,
  aviosBalance,
  costMode,
  effectiveEarningCost,
  onCardTypeChange,
  onCustomEarningRateChange,
  onAviosBalanceChange,
}: SetupFormProps) {
  const selectedMethod = EARNING_METHODS.find(p => p.id === cardType);
  const methodsByCategory = getMethodsByCategory();
  
  const getModeLabel = (mode: CostCalculationMode) => {
    switch (mode) {
      case 'simple': return 'Simple';
      case 'average': return 'Average';
      case 'portfolio': return 'Portfolio';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Earning Method</CardTitle>
          <Badge variant="outline" className="text-xs">
            {getModeLabel(costMode)} Mode
          </Badge>
        </div>
        <CardDescription>
          {costMode === 'simple' && 'Using your current primary earning method'}
          {costMode === 'average' && 'Using your custom average earning cost'}
          {costMode === 'portfolio' && 'Using weighted average from your portfolio'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="earning-method">
            {costMode === 'simple' ? 'Current Earning Method' : 'Primary Earning Method'}
          </Label>
          <Select value={cardType} onValueChange={(value) => onCardTypeChange(value as CardType)}>
            <SelectTrigger id="earning-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from(methodsByCategory.entries()).map(([category, methods]) => (
                <SelectGroup key={category}>
                  <SelectLabel className="text-xs font-semibold text-muted-foreground">
                    {category}
                  </SelectLabel>
                  {methods.map(method => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          {selectedMethod && (
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-sm font-medium">{selectedMethod.description}</p>
              <p className="text-xs text-muted-foreground">
                Method cost: {selectedMethod.earningCost.toFixed(2)}p per Avios
                {selectedMethod.annualFee > 0 && ` • Annual fee: £${selectedMethod.annualFee}`}
              </p>
            </div>
          )}
        </div>
        
        {/* Show effective cost */}
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
          <p className="text-sm font-semibold text-primary">
            Effective Earning Cost: {effectiveEarningCost.toFixed(2)}p per Avios
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This is the cost used for all calculations
          </p>
        </div>
        
        {cardType === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="custom-rate">Custom Earning Rate (Avios per £1)</Label>
            <Input
              id="custom-rate"
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={customEarningRate || 1.0}
              onChange={(e) => onCustomEarningRateChange(parseFloat(e.target.value) || 1.0)}
            />
            <p className="text-xs text-muted-foreground">
              Enter how many Avios you earn per £1 spent
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="avios-balance">Current Avios Balance (optional)</Label>
          <Input
            id="avios-balance"
            type="number"
            min="0"
            placeholder="e.g., 63285"
            value={aviosBalance || ''}
            onChange={(e) => onAviosBalanceChange(e.target.value ? parseInt(e.target.value) : undefined)}
          />
          <p className="text-xs text-muted-foreground">
            See which options are within your balance
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
