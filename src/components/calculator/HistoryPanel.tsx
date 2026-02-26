'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { storage } from '@/src/lib/storage';
import { CalculationHistory } from '@/src/lib/types';
import { formatCurrency, formatAvios } from '@/src/lib/calculations';

export function HistoryPanel() {
  const [history, setHistory] = useState<CalculationHistory[]>([]);

  useEffect(() => {
    setHistory(storage.getHistory());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculation History</CardTitle>
        <CardDescription>
          Your last {history.length > 0 ? Math.min(history.length, 20) : 0} calculations (stored locally)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No calculations yet. Your history will appear here after you calculate.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map(entry => {
              const optimal = entry.results.find(r => r.isOptimal);
              const leastBad = !optimal ? entry.results.find(r => r.isLeastBad) : undefined;
              const featured = optimal ?? leastBad;

              return (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-4 rounded-md border p-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {new Date(entry.timestamp).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-muted-foreground">
                      Cash price: {formatCurrency(entry.input.cashPrice)}
                      {entry.input.numberOfPeople > 1 && ` · ${entry.input.numberOfPeople} people`}
                      {' · '}
                      {entry.results.length} option{entry.results.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {featured && (
                    <div className="text-right shrink-0">
                      <p className="font-medium text-green-600">
                        {formatAvios(featured.option.avios)} Avios
                      </p>
                      <p className="text-muted-foreground">
                        + {formatCurrency(featured.option.cash)}
                      </p>
                      {leastBad && (
                        <Badge className="mt-1 bg-amber-800 text-xs">least bad</Badge>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
