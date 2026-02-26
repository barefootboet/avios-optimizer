'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

interface AverageCostInputProps {
  value: number | undefined;
  onChange: (cost: number) => void;
}

export function AverageCostInput({ value, onChange }: AverageCostInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Your Average Earning Cost
        </CardTitle>
        <CardDescription>
          Enter the average cost per Avios across all your earning methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="avg-cost">Average Cost (pence per Avios)</Label>
          <Input
            id="avg-cost"
            type="number"
            step="0.01"
            min="0.01"
            max="5"
            placeholder="e.g., 0.50"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">
            Example: If you earned 50,000 from flying (0.11p) and 50,000 from credit card (0.67p), your average would be ~0.39p
          </p>
        </div>
        
        {value && value > 0 && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">
              Earning cost: {value.toFixed(2)}p per Avios
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This will be used for all calculations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
