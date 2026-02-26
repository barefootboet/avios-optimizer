'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { AviosOption } from '@/lib/types';

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

  const handleCalculate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const pendingAvios = parseInt(String(newAvios).replace(/,/g, ''), 10);
    const pendingCash = parseFloat(String(newCash).replace(/,/g, ''));
    const hasPending = pendingAvios > 0 && !Number.isNaN(pendingCash) && pendingCash >= 0;
    onCalculate(hasPending ? { avios: pendingAvios, cash: pendingCash } : undefined);
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
          
          {options.map((option) => (
            <div key={option.id} className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Avios"
                value={option.avios}
                onChange={(e) => onUpdateOption(option.id, parseInt(e.target.value) || 0, option.cash)}
                className="flex-1"
              />
              <span className="text-muted-foreground">+</span>
              <Input
                type="number"
                step="0.01"
                placeholder="£"
                value={option.cash}
                onChange={(e) => onUpdateOption(option.id, option.avios, parseFloat(e.target.value) || 0)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => onRemoveOption(option.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Avios (e.g., 43000)"
              value={newAvios}
              onChange={(e) => setNewAvios(e.target.value)}
              className="flex-1"
            />
            <span className="text-muted-foreground">+</span>
            <Input
              type="number"
              step="0.01"
              placeholder="£ (e.g., 169.40)"
              value={newCash}
              onChange={(e) => setNewCash(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddOption}
            >
              <Plus className="h-4 w-4" />
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
