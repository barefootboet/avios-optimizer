'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Input } from '@/src/components/ui/input';
import { CARD_PRESETS } from '@/src/lib/constants';
import { CardType } from '@/src/lib/types';

interface SetupFormProps {
  cardType: CardType;
  customEarningRate?: number;
  aviosBalance?: number;
  onCardTypeChange: (type: CardType) => void;
  onCustomEarningRateChange: (rate: number) => void;
  onAviosBalanceChange: (balance: number | undefined) => void;
}

export function SetupForm({
  cardType,
  customEarningRate,
  aviosBalance,
  onCardTypeChange,
  onCustomEarningRateChange,
  onAviosBalanceChange,
}: SetupFormProps) {
  const selectedPreset = CARD_PRESETS.find(p => p.id === cardType);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
          Set up your BA card to calculate accurate Avios values
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="card-type">BA Credit Card</Label>
          <Select value={cardType} onValueChange={(value) => onCardTypeChange(value as CardType)}>
            <SelectTrigger id="card-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CARD_PRESETS.map(preset => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPreset && (
            <p className="text-sm text-muted-foreground">
              {selectedPreset.description} · Earning cost: {selectedPreset.earningCost.toFixed(2)}p per Avios
            </p>
          )}
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
        </div>
      </CardContent>
    </Card>
  );
}
