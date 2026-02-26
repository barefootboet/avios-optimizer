'use client';

import { SetupForm } from '@/components/calculator/SetupForm';
import { CostModeSelector } from '@/components/calculator/CostModeSelector';
import { AverageCostInput } from '@/components/calculator/AverageCostInput';
import { PortfolioTracker } from '@/components/calculator/PortfolioTracker';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { ResultsTable } from '@/components/calculator/ResultsTable';
import { RecommendationCard } from '@/components/calculator/RecommendationCard';
import { useProfile } from '@/hooks/useProfile';
import { useCalculator } from '@/hooks/useCalculator';

export default function Home() {
  const {
    profile,
    effectiveEarningCost,
    updateCardType,
    updateCostCalculationMode,
    updateCustomAverageCost,
    updateCustomEarningRate,
    updateAviosBalance,
    addAviosSource,
    removeAviosSource,
    updateAviosSource,
  } = useProfile();
  
  const calculator = useCalculator(effectiveEarningCost);
  
  const optimalResult = calculator.results.find(r => r.isOptimal);
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Avios Optimizer
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the best value when booking with British Airways Avios
          </p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Setup */}
          <div className="lg:col-span-1 space-y-6">
            <CostModeSelector
              mode={profile.costCalculationMode}
              onModeChange={updateCostCalculationMode}
            />
            
            <SetupForm
              cardType={profile.cardType}
              customEarningRate={profile.customEarningRate}
              aviosBalance={profile.aviosBalance}
              costMode={profile.costCalculationMode}
              effectiveEarningCost={effectiveEarningCost}
              onCardTypeChange={updateCardType}
              onCustomEarningRateChange={updateCustomEarningRate}
              onAviosBalanceChange={updateAviosBalance}
            />
            
            {profile.costCalculationMode === 'average' && (
              <AverageCostInput
                value={profile.customAverageCost}
                onChange={updateCustomAverageCost}
              />
            )}
            
            {profile.costCalculationMode === 'portfolio' && (
              <PortfolioTracker
                sources={profile.aviosSources}
                onAddSource={addAviosSource}
                onRemoveSource={removeAviosSource}
                onUpdateSource={updateAviosSource}
              />
            )}
          </div>
          
          {/* Middle Column - Calculator */}
          <div className="lg:col-span-1 space-y-6">
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
          
          {/* Right Column - Results */}
          <div className="lg:col-span-1 space-y-6">
            {optimalResult && <RecommendationCard result={optimalResult} />}
            {calculator.results.length > 0 && <ResultsTable results={calculator.results} />}
          </div>
        </div>
      </div>
    </main>
  );
}
