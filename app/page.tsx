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
import { Plane, Calculator, TrendingUp } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="h-10 w-10" />
            <h1 className="text-5xl font-bold">Avios Optimizer</h1>
          </div>
          <p className="text-center text-xl text-blue-100 max-w-2xl mx-auto">
            Make smarter redemption decisions with British Airways Avios. Calculate the true value of your points.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Step Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
              <h3 className="font-semibold text-lg">Choose Method</h3>
            </div>
            <p className="text-sm text-muted-foreground">Select how you earn Avios</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-2 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
              <h3 className="font-semibold text-lg">Enter Options</h3>
            </div>
            <p className="text-sm text-muted-foreground">Add Avios + cash combinations</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
              <h3 className="font-semibold text-lg">Get Results</h3>
            </div>
            <p className="text-sm text-muted-foreground">See optimal redemption</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-12">

          {/* Left Column - Configuration (Step 1) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-1">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 mb-4">
                <h2 className="text-white font-bold text-xl flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Step 1: Configuration
                </h2>
              </div>
              <div className="p-4 space-y-4">
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
            </div>
          </div>

          {/* Middle Column - Calculator (Step 2) */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-1 sticky top-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 mb-4">
                <h2 className="text-white font-bold text-xl flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Step 2: Trip Details
                </h2>
              </div>
              <div className="p-4">
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
            </div>
          </div>

          {/* Right Column - Results (Step 3) */}
          <div className="lg:col-span-4 space-y-6">
            {(optimalResult || calculator.results.length > 0) && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-1">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 mb-4">
                  <h2 className="text-white font-bold text-xl flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Step 3: Results
                  </h2>
                </div>
                <div className="p-4 space-y-6">
                  {optimalResult && <RecommendationCard result={optimalResult} />}
                  {calculator.results.length > 0 && <ResultsTable results={calculator.results} />}
                </div>
              </div>
            )}

            {!optimalResult && calculator.results.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold mb-2">Ready to Calculate</h3>
                <p className="text-sm text-muted-foreground">
                  Complete steps 1 and 2, then click &quot;Calculate Best Value&quot; to see your optimal redemption.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Pro Tip:</strong> Gold/Silver flyers get exceptional value (0.11p-0.13p earning cost) compared to credit card spend (0.67p-1.0p). Use Portfolio Mode to track your mixed earnings!
          </p>
        </div>
      </div>
    </div>
  );
}
