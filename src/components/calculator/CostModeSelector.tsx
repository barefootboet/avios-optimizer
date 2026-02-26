'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CostCalculationMode } from '@/lib/types';
import { Info } from 'lucide-react';

interface CostModeSelectorProps {
  mode: CostCalculationMode;
  onModeChange: (mode: CostCalculationMode) => void;
}

export function CostModeSelector({ mode, onModeChange }: CostModeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">How to Calculate Earning Cost</CardTitle>
        <CardDescription>
          Choose how you want to determine the cost of your Avios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={mode} onValueChange={(value) => onModeChange(value as CostCalculationMode)}>
          <div className="space-y-4">
            {/* Simple Mode */}
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="simple" id="mode-simple" />
              <div className="flex-1">
                <Label 
                  htmlFor="mode-simple" 
                  className="font-semibold cursor-pointer"
                >
                  Simple Mode (Recommended)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Use your current primary earning method. Best for most users.
                </p>
                <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-800 dark:text-blue-200">
                    This represents your opportunity cost - what it would cost you to re-earn the Avios today.
                  </span>
                </div>
              </div>
            </div>
            
            {/* Average Mode */}
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="average" id="mode-average" />
              <div className="flex-1">
                <Label 
                  htmlFor="mode-average" 
                  className="font-semibold cursor-pointer"
                >
                  Average Mode
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a single average cost if you know it. Good for mixed earning.
                </p>
              </div>
            </div>
            
            {/* Portfolio Mode */}
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="portfolio" id="mode-portfolio" />
              <div className="flex-1">
                <Label 
                  htmlFor="mode-portfolio" 
                  className="font-semibold cursor-pointer"
                >
                  Portfolio Mode (Most Accurate)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Track exactly how you earned each portion of your Avios balance. Calculates weighted average automatically.
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
