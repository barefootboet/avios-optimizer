# Testing Guide for Avios Optimizer

This guide provides comprehensive test cases to verify the Avios Optimizer application works correctly.

## Quick Start Test

1. Open http://localhost:3000
2. The app should load with:
   - "Avios Optimizer" heading
   - "Your Profile" card on the left
   - "Trip Details" card below it
   - Empty results area on the right

## Test Case 1: Basic Calculation (Premium Plus Card)

### Setup
1. **Card Selection**: BA American Express Premium Plus (should be default)
   - Verify earning cost shows: 0.67p per Avios

### Input
1. **Cash Price**: 850
2. **Number of People**: 2
3. **Add Options**:
   - Option 1: 43000 Avios + 169.40
   - Option 2: 32000 Avios + 269.20
   - Option 3: 25600 Avios + 337.60

### Execute
Click "Calculate Best Value"

### Expected Results

**Recommendation Card** (should show Option 2):
- Avios Required: 32,000
- Cash Required: £269.20
- Value per Avios: 1.82p
- Profit Margin: +172.0%
- Total Cost: £483.60

**Results Table** (sorted by total cost):

| Avios   | Cash    | Value/Avios | Profit   | Total Cost | Rating    | Best |
|---------|---------|-------------|----------|------------|-----------|------|
| 32,000  | £269.20 | 1.82p       | +172.0%  | £483.60    | excellent | ✓    |
| 43,000  | £169.40 | 1.58p       | +136.0%  | £457.81    | excellent |      |
| 25,600  | £337.60 | 2.00p       | +198.5%  | £509.12    | excellent |      |

**Note**: Option 2 should be marked as "Best" despite having a lower value per Avios because it has the lowest total cost.

## Test Case 2: Free Card Comparison

### Setup
1. **Card Selection**: Change to "BA American Express (Free)"
   - Verify earning cost changes to: 1.00p per Avios

### Input
Use the same options from Test Case 1:
- Cash Price: 850
- Number of People: 2
- Options: Same as above

### Execute
Click "Calculate Best Value"

### Expected Results

**Recommendation Card** (should show Option 1):
- Avios Required: 43,000
- Cash Required: £169.40
- Value per Avios: 1.58p
- Profit Margin: +58.0%
- Total Cost: £599.40

**Key Observation**: With a higher earning cost (1p vs 0.67p), Option 1 becomes optimal because it uses fewer Avios.

## Test Case 3: Custom Earning Rate

### Setup
1. **Card Selection**: Select "Custom Earning Rate"
2. **Custom Earning Rate**: Enter 2.0 (2 Avios per £1)
   - This means earning cost = 0.5p per Avios

### Input
- Cash Price: 500
- Number of People: 1
- Options:
  - Option 1: 20000 Avios + 100
  - Option 2: 15000 Avios + 150

### Execute
Click "Calculate Best Value"

### Expected Results

**For Option 1**:
- Cash Saved: £400
- Value per Avios: 2.00p
- Profit Margin: +300% (2.00p / 0.5p - 1 = 3 = 300%)
- Total Cost: £200

**For Option 2**:
- Cash Saved: £350
- Value per Avios: 2.33p
- Profit Margin: +366%
- Total Cost: £225

Option 1 should be marked as "Best" (lowest total cost).

## Test Case 4: Poor Value Detection

### Setup
1. **Card Selection**: BA Premium Plus (0.67p earning cost)

### Input
- Cash Price: 200
- Number of People: 1
- Options:
  - Option 1: 50000 Avios + 150
    - This is a poor deal: only saving £50 for 50,000 Avios

### Execute
Click "Calculate Best Value"

### Expected Results

**For Option 1**:
- Cash Saved: £50
- Value per Avios: 0.10p
- Profit Margin: -85.1% (negative!)
- Total Cost: £485
- Rating: **poor** (red badge)

**Recommendation Card** should still show this option but with warning text:
"Below your earning cost. You're getting -85.1% less value than what it cost you to earn these Avios. Consider paying cash instead."

## Test Case 5: Edge Cases

### Test 5a: Zero Cash Option
**Input**: 30000 Avios + 0 (cash)
**Expected**: Should calculate correctly with £0 cash component

### Test 5b: Very Large Numbers
**Input**: 
- Cash Price: 10000
- Option: 500000 Avios + 2000
**Expected**: Should format numbers with proper separators (500,000)

### Test 5c: Decimal Precision
**Input**: 
- Cash Price: 425.99
- Option: 25000 Avios + 169.47
**Expected**: Should handle decimals correctly in calculations

## Test Case 6: UI/UX Features

### Test 6a: Add/Remove Options
1. Add 3 options
2. Remove the middle one
3. Verify the correct option is removed
4. Add another option
5. Verify it appears at the bottom

### Test 6b: Edit Existing Options
1. Add an option: 30000 Avios + 200
2. Edit it to: 35000 Avios + 180
3. Recalculate
4. Verify results reflect the updated values

### Test 6c: Disabled Calculate Button
1. Clear all inputs
2. Verify "Calculate Best Value" button is disabled
3. Add cash price only (no options)
4. Verify button is still disabled
5. Add at least one option
6. Verify button becomes enabled

## Test Case 7: localStorage Persistence

### Test 7a: Profile Persistence
1. Select "BA Premium Plus"
2. Enter Avios Balance: 100000
3. Refresh the page
4. Verify card selection and balance are restored

### Test 7b: Custom Rate Persistence
1. Select "Custom Earning Rate"
2. Enter: 1.75
3. Refresh the page
4. Verify custom rate is restored

## Test Case 8: Responsive Design

### Desktop (>1024px)
- Two-column layout
- Profile and calculator on left
- Results on right

### Tablet (768px - 1024px)
- Two-column layout maintained
- Slightly narrower

### Mobile (<768px)
- Single column layout
- Profile card first
- Calculator card second
- Results cards below

## Test Case 9: Dark Mode

1. Enable dark mode in your system settings
2. Verify the app switches to dark theme
3. Check all components are readable:
   - Cards have dark backgrounds
   - Text is light colored
   - Borders are visible
   - Green highlights still work

## Test Case 10: Calculation History

1. Perform 3 different calculations
2. Open browser DevTools > Application > Local Storage
3. Check `avios-optimizer-history` key
4. Verify it contains array of calculation objects
5. Perform 20+ more calculations
6. Verify only last 20 are kept

## Common Issues & Solutions

### Issue: "Calculate Best Value" button doesn't work
**Solution**: Ensure both cash price > 0 and at least one option is added

### Issue: Results don't appear
**Solution**: Check browser console for errors. Verify all required fields are filled.

### Issue: Numbers look wrong
**Solution**: Remember:
- Value per Avios is in PENCE (not pounds)
- Earning cost is in PENCE (not pounds)
- Total cost is in POUNDS

### Issue: Wrong option marked as "Best"
**Solution**: The "Best" option is the one with LOWEST TOTAL COST among options with profit margin ≥ 0%, not necessarily the highest value per Avios.

## Performance Benchmarks

- Initial page load: < 2 seconds
- Calculation time: < 100ms
- Re-render after input: < 50ms

## Accessibility Checklist

- [ ] All form inputs have labels
- [ ] Buttons have descriptive text
- [ ] Color is not the only indicator (badges have text)
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Automated Testing (Future)

For production deployment, consider adding:
- Unit tests for calculation functions
- Integration tests for React components
- E2E tests with Playwright or Cypress
- Visual regression tests
