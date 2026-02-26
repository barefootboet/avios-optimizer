'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AviosSource, CardType } from '@/lib/types';
import { EARNING_METHODS, getMethodsByCategory } from '@/lib/constants';
import { formatAvios } from '@/lib/calculations';
import { calculateBlendedCost, getTotalAviosFromSources } from '@/lib/costCalculations';
import { Trash2, Plus, Wallet } from 'lucide-react';

interface PortfolioTrackerProps {
  sources: AviosSource[];
  onAddSource: (methodId: CardType, amount: number) => void;
  onRemoveSource: (id: string) => void;
  onUpdateSource: (id: string, amount: number) => void;
}

export function PortfolioTracker({
  sources,
  onAddSource,
  onRemoveSource,
  onUpdateSource,
}: PortfolioTrackerProps) {
  const [newMethodId, setNewMethodId] = useState<CardType | ''>('');
  const [newAmount, setNewAmount] = useState<string>('');
  
  const methodsByCategory = getMethodsByCategory();
  const totalAvios = getTotalAviosFromSources(sources);
  const blendedCost = calculateBlendedCost(sources);
  
  const handleAdd = () => {
    if (!newMethodId || !newAmount) return;
    
    const amount = parseInt(newAmount);
    if (amount <= 0) return;
    
    onAddSource(newMethodId as CardType, amount);
    setNewMethodId('');
    setNewAmount('');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Your Avios Portfolio
        </CardTitle>
        <CardDescription>
          Track exactly how you earned your Avios for precise calculations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Sources */}
        {sources.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Earning Sources</Label>
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{source.methodName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      value={source.amount}
                      onChange={(e) => onUpdateSource(source.id, parseInt(e.target.value) || 0)}
                      className="w-32 h-8 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">
                      Avios @ {source.earningCost.toFixed(2)}p each
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveSource(source.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Add New Source */}
        <div className="border-t pt-4 space-y-3">
          <Label className="text-sm font-medium">Add Earning Source</Label>
          
          <div className="space-y-2">
            <Label htmlFor="new-method" className="text-xs">How did you earn these Avios?</Label>
            <Select value={newMethodId} onValueChange={(value) => setNewMethodId(value as CardType)}>
              <SelectTrigger id="new-method">
                <SelectValue placeholder="Select earning method" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(methodsByCategory.entries()).map(([category, methods]) => (
                  <SelectGroup key={category}>
                    <SelectLabel className="text-xs font-semibold text-muted-foreground">
                      {category}
                    </SelectLabel>
                    {methods.map(method => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name} ({method.earningCost.toFixed(2)}p)
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-amount" className="text-xs">How many Avios?</Label>
            <Input
              id="new-amount"
              type="number"
              min="1"
              placeholder="e.g., 15000"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
          </div>
          
          <Button
            className="w-full"
            onClick={handleAdd}
            disabled={!newMethodId || !newAmount}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
        
        {/* Summary */}
        {sources.length > 0 && (
          <div className="border-t pt-4">
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Avios:</span>
                <span className="text-lg font-bold">{formatAvios(totalAvios)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Blended Earning Cost:</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {blendedCost.toFixed(2)}p
                </span>
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t">
                This weighted average cost will be used for all redemption calculations
              </p>
            </div>
          </div>
        )}
        
        {sources.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No earning sources added yet.</p>
            <p className="text-xs mt-1">Add your first source above to track your portfolio.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
