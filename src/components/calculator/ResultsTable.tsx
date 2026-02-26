'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';
import { CalculationResult } from '@/src/lib/types';
import { formatCurrency, formatAvios, formatPercentage, formatValuePerAvios } from '@/src/lib/calculations';
import { Badge } from '@/src/components/ui/badge';
import { Info } from 'lucide-react';

interface ResultsTableProps {
  results: CalculationResult[];
}

/** Returns a Tailwind className that passes WCAG AA contrast for badge text. */
function getRecommendationColor(rec: CalculationResult['recommendation']): string {
  switch (rec) {
    case 'excellent': return 'bg-green-500';
    case 'good':      return 'bg-blue-500';
    // amber-800 (#92400e) with white text gives ~6.6:1 — passes WCAG AA
    case 'ok':        return 'bg-amber-800';
    case 'poor':      return 'bg-red-500';
  }
}

function MetricHeader({ label, description }: { label: string; description: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">
            <Info className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">About {label}: {description}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

export function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) return null;

  const hasPerPerson = results.some(r => r.perPersonTotalCost !== undefined);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            Comparing all options — lower total cost is better
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Avios</TableHead>
                  <TableHead scope="col">Cash</TableHead>
                  <TableHead scope="col">
                    <MetricHeader
                      label="Value/Avios (p)"
                      description="Pence of cash saving per Avios used. Higher is better."
                    />
                  </TableHead>
                  <TableHead scope="col">
                    <MetricHeader
                      label="Profit"
                      description="How much better the redemption value is vs your earning cost. Above 0% means you got more value than you gave up."
                    />
                  </TableHead>
                  <TableHead scope="col">
                    <MetricHeader
                      label="Total Cost"
                      description="Cash paid + opportunity cost of Avios (vs 1% cashback baseline). Lower is better."
                    />
                  </TableHead>
                  {hasPerPerson && (
                    <TableHead scope="col">
                      <MetricHeader
                        label="Per Person"
                        description="Total cost divided by number of travellers."
                      />
                    </TableHead>
                  )}
                  <TableHead scope="col">Rating</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {results.map((result) => {
                const rowHighlight = result.isOptimal
                  ? 'bg-green-50 dark:bg-green-950'
                  : result.isLeastBad
                    ? 'bg-amber-50 dark:bg-amber-950'
                    : '';
                return (
                  <TableRow key={result.option.id} className={rowHighlight}>
                    <TableCell className="font-medium">
                      {formatAvios(result.option.avios)}
                      {result.isOptimal && (
                        <Badge className="ml-2" variant="default">Best</Badge>
                      )}
                      {result.isLeastBad && (
                        <Badge className="ml-2 bg-amber-800">Least bad</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(result.option.cash)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatValuePerAvios(result.valuePerAvios)}
                    </TableCell>
                    <TableCell>
                      <span className={result.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercentage(result.profitMargin)}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(result.totalCost)}</TableCell>
                    {hasPerPerson && (
                      <TableCell>
                        {result.perPersonTotalCost !== undefined
                          ? formatCurrency(result.perPersonTotalCost)
                          : '—'}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge className={getRecommendationColor(result.recommendation)}>
                        {result.recommendation}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
