'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { AviosOption } from '@/src/lib/types';

interface CalculatorFormProps {
  cashPrice: number;
  numberOfPeople: number;
  options: AviosOption[];
  onCashPriceChange: (price: number) => void;
  onNumberOfPeopleChange: (people: number) => void;
  onAddOption: (avios: number, cash: number) => void;
  onRemoveOption: (id: string) => void;
  onUpdateOption: (id: string, avios: number, cash: number) => void;
  onCalculate: (pendingOption?: { avios: number; cash: number }) => void;
}

export function CalculatorForm({
  cashPrice,
  numberOfPeople,
  options,
  onCashPriceChange,
  onNumberOfPeopleChange,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onCalculate,
}: CalculatorFormProps) {
  const [newAvios, setNewAvios] = useState<string>('');
  const [newCash, setNewCash] = useState<string>('');
  
  const handleAddOption = () => {
    const avios = parseInt(newAvios, 10);
    const cash = parseFloat(newCash);
    if (avios > 0 && !Number.isNaN(cash) && cash >= 0) {
      onAddOption(avios, cash);
      setNewAvios('');
      setNewCash('');
    }
  };

  /** Shared calculate logic — used by button click and Enter key. */
  const triggerCalculate = () => {
    const pendingAvios = parseInt(newAvios, 10);
    const pendingCash = parseFloat(newCash);
    const hasPending = pendingAvios > 0 && !Number.isNaN(pendingCash) && pendingCash >= 0;
    onCalculate(hasPending ? { avios: pendingAvios, cash: pendingCash } : undefined);
  };

  const handleCalculate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    triggerCalculate();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canCalculate) {
      e.preventDefault();
      triggerCalculate();
    }
  };

  const canCalculate =
    cashPrice > 0 &&
    (options.length > 0 ||
      (parseInt(newAvios, 10) > 0 && !Number.isNaN(parseFloat(newCash)) && parseFloat(newCash) >= 0));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Details</CardTitle>
        <CardDescription>
          Enter the cash price and Avios options you're comparing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cash-price">Cash Price (£)</Label>
            <Input
              id="cash-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 425"
              value={cashPrice === 0 ? '' : cashPrice}
              onChange={(e) => onCashPriceChange(parseFloat(e.target.value) || 0)}
              onBlur={(e) => onCashPriceChange(parseFloat(e.target.value) || 0)}
              onKeyDown={handleKeyDown}
            />
            <p className="text-xs text-muted-foreground">
              Total cash price for all people
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="num-people">Number of People</Label>
            <Input
              id="num-people"
              type="number"
              min="1"
              max="9"
              value={numberOfPeople}
              onChange={(e) => onNumberOfPeopleChange(parseInt(e.target.value) || 1)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Avios Options</Label>
            <p className="text-sm text-muted-foreground">
              Add the Avios + cash options you're comparing
            </p>
          </div>
          
          {options.map((option, index) => (
            <div key={option.id} className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Avios"
                aria-label={`Avios for option ${index + 1}`}
                value={option.avios}
                onChange={(e) => onUpdateOption(option.id, parseInt(e.target.value) || 0, option.cash)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <span aria-hidden="true" className="text-muted-foreground">+</span>
              <Input
                type="number"
                step="0.01"
                placeholder="£"
                aria-label={`Cash surcharge for option ${index + 1} (£)`}
                value={option.cash}
                onChange={(e) => onUpdateOption(option.id, option.avios, parseFloat(e.target.value) || 0)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                aria-label={`Remove option ${index + 1}`}
                onClick={() => onRemoveOption(option.id)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Avios (e.g., 43000)"
              aria-label="Avios for new option"
              value={newAvios}
              onChange={(e) => setNewAvios(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <span aria-hidden="true" className="text-muted-foreground">+</span>
            <Input
              type="number"
              step="0.01"
              placeholder="£ (e.g., 169.40)"
              aria-label="Cash surcharge for new option (£)"
              value={newCash}
              onChange={(e) => setNewCash(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              aria-label="Add Avios option"
              onClick={handleAddOption}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        
        <Button
          type="button"
          className="w-full"
          size="lg"
          onClick={handleCalculate}
          disabled={!canCalculate}
        >
          Calculate Best Value
        </Button>
      </CardContent>
    </Card>
  );
}
