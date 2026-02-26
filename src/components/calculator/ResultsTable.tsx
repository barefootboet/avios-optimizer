'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { CalculationResult } from '@/src/lib/types';
import { formatCurrency, formatAvios, formatPercentage, formatValuePerAvios } from '@/src/lib/calculations';
import { Badge } from '@/src/components/ui/badge';

interface ResultsTableProps {
  results: CalculationResult[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) return null;
  
  const getRecommendationColor = (rec: CalculationResult['recommendation']) => {
    switch (rec) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'ok': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>
          Comparing all options - lower total cost is better
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avios</TableHead>
                <TableHead>Cash</TableHead>
                <TableHead>Value/Avios</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow
                  key={result.option.id}
                  className={result.isOptimal ? 'bg-green-50 dark:bg-green-950' : ''}
                >
                  <TableCell className="font-medium">
                    {formatAvios(result.option.avios)}
                    {result.isOptimal && (
                      <Badge className="ml-2" variant="default">Best</Badge>
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
                  <TableCell>
                    <Badge className={getRecommendationColor(result.recommendation)}>
                      {result.recommendation}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
