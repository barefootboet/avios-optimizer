'use client';

import { useRef, useEffect, useState } from 'react';
import { SetupForm } from '@/src/components/calculator/SetupForm';
import { CalculatorForm } from '@/src/components/calculator/CalculatorForm';
import { ResultsTable } from '@/src/components/calculator/ResultsTable';
import { RecommendationCard } from '@/src/components/calculator/RecommendationCard';
import { HistoryPanel } from '@/src/components/calculator/HistoryPanel';
import { useProfile } from '@/src/hooks/useProfile';
import { useCalculator } from '@/src/hooks/useCalculator';
import { History } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function Home() {
  const { profile, updateCardType, updateCustomEarningRate, updateAviosBalance } = useProfile();
  const calculator = useCalculator(profile.earningCost, profile);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);

  // isOptimal = good value; isLeastBad = all options poor but show the least-bad one
  const highlightedResult = calculator.results.find(r => r.isOptimal || r.isLeastBad);

  useEffect(() => {
    if (calculator.results.length > 0 && resultsRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      resultsRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'instant' : 'smooth',
        block: 'start',
      });
      resultsRef.current.focus({ preventScroll: true });
    }
  }, [calculator.results.length]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <a
        href="#results"
        className="absolute left-4 -top-20 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-md outline-none ring-2 ring-transparent focus:top-4 focus:ring-ring motion-safe:transition-[top]"
      >
        Skip to results
      </a>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Avios Optimizer
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the best value when booking with British Airways Avios
          </p>
          <div className="flex justify-center pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(h => !h)}
              aria-expanded={showHistory}
              aria-controls="history-panel"
            >
              <History className="h-4 w-4 mr-2" aria-hidden="true" />
              {showHistory ? 'Hide history' : 'Calculation history'}
            </Button>
          </div>
        </div>

        {showHistory && (
          <div id="history-panel">
            <HistoryPanel />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <SetupForm
              cardType={profile.cardType}
              customEarningRate={profile.customEarningRate}
              aviosBalance={profile.aviosBalance}
              onCardTypeChange={updateCardType}
              onCustomEarningRateChange={updateCustomEarningRate}
              onAviosBalanceChange={updateAviosBalance}
            />

            <CalculatorForm
              cashPrice={calculator.cashPrice}
              numberOfPeople={calculator.numberOfPeople}
              options={calculator.options}
              onCashPriceChange={calculator.setCashPrice}
              onNumberOfPeopleChange={calculator.setNumberOfPeople}
              onAddOption={calculator.addOption}
              onRemoveOption={calculator.removeOption}
              onUpdateOption={calculator.updateOption}
              onCalculate={calculator.calculate}
            />
          </div>

          <div
            id="results"
            ref={resultsRef}
            tabIndex={-1}
            role="region"
            aria-live="polite"
            aria-label="Calculation results"
            className="space-y-6 outline-none"
          >
            {calculator.error && (
              <div
                role="alert"
                className="rounded-md border border-destructive bg-destructive/10 p-4"
              >
                <p className="text-sm font-medium text-destructive">{calculator.error}</p>
              </div>
            )}

            {calculator.results.length === 0 && !calculator.error && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
                <p className="text-muted-foreground font-medium">
                  Your results will appear here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter trip details on the left and click Calculate Best Value
                </p>
              </div>
            )}

            {highlightedResult && <RecommendationCard result={highlightedResult} />}
            {calculator.results.length > 0 && <ResultsTable results={calculator.results} />}
          </div>
        </div>
      </div>
    </main>
  );
}
