# Avios Optimizer — Full Code Review

**Reviewer perspective:** Senior software engineer / tech lead  
**Scope:** Structure, performance, extensibility, and general coding practices  
**Date:** February 2026

---

## Executive Summary

The Avios Optimizer is a well-structured Next.js 14+ app with clear separation of concerns, solid TypeScript usage, and a maintainable layout. It is suitable for production with a few targeted improvements. This review covers strengths, risks, and concrete recommendations.

---

## 1. Structure & Architecture

### 1.1 Project Layout

```
avios-optimizer/
├── app/                    # Next.js App Router (routes, layout, global styles)
├── src/
│   ├── components/        # UI: calculator + shared primitives (shadcn)
│   ├── hooks/             # useProfile, useCalculator
│   └── lib/               # types, constants, calculations, storage, utils
├── public/
└── config (tsconfig, next.config, tailwind, etc.)
```

**Strengths**

- **Clear layering:** `lib` holds pure logic and types; `hooks` own state and side effects; `components` are presentational/UI. No business logic in UI.
- **Colocation:** Calculator-specific components live under `components/calculator/`; shared UI under `components/ui/`.
- **Single entry page:** One main page keeps routing simple; easy to add routes later under `app/` without refactors.
- **Path alias:** `@/` points at project root, giving consistent imports (`@/src/lib/...`, `@/src/components/...`).

**Recommendations**

- Consider aligning `@/*` with `src/*` (e.g. `@/components`, `@/lib`) so imports don’t repeat `src`. Optional; current setup is fine.
- If the app grows, add `app/(marketing)/` or `app/(app)/` route groups and move layout/headings into shared layouts.

**Verdict:** **Good** — Structure supports current scope and moderate growth.

---

## 2. TypeScript & Types

### 2.1 Type Design

- **Strict mode:** `tsconfig` has `"strict": true`. No `any` in the codebase.
- **Domain types:** `types.ts` defines `CardType`, `CardPreset`, `UserProfile`, `AviosOption`, `CalculationInput`, `CalculationResult`, `CalculationHistory` with clear roles.
- **Discriminated usage:** Recommendation is a union (`'excellent' | 'good' | 'ok' | 'poor'`) and is used consistently in calculations and UI.

**Strengths**

- Types document “cash in pounds”, “earning cost in pence”, “value per Avios in pence”.
- Interfaces are minimal and focused; no unnecessary optional fields.
- `CalculationHistory` ties together input, results, and profile for storage and future features (e.g. history view).

**Gaps**

- **Storage payloads:** `storage.getProfile()` and `getHistory()` return `JSON.parse(data)` with no runtime validation. Corrupted or old localStorage can produce wrong types and runtime errors.
- **Recommendation:** Add lightweight validation (e.g. Zod) for persisted data and fall back to defaults when invalid.

**Verdict:** **Good** — Strong typing; add validation at boundaries (storage, future APIs).

---

## 3. Core Logic (lib/calculations.ts)

### 3.1 Correctness

- Formulas match the spec: cash saved, value per Avios (pence), profit margin, total cost.
- Edge cases partially handled:
  - `option.avios === 0` → `valuePerAvios` becomes `Infinity`; no guard.
  - `earningCost === 0` → `profitMargin` becomes `Infinity`; no guard.
- `calculateAllOptions` mutates the array with `.sort()` in place, then the caller copies with `[...calculatedResults]`, so React sees new references. Good.

**Recommendations**

- Guard against `option.avios === 0` (and optionally `earningCost === 0`): return a safe result or skip/flag the option instead of producing Infinity/NaN.
- Keep calculation functions pure (no React, no DOM). They are; maintain that.

**Verdict:** **Good** — Logic is correct; add guards for zero/undefined to avoid Infinity/NaN.

---

## 4. State & Hooks

### 4.1 useCalculator

- Uses `useState` for cash price, people, options, results; `useRef` for latest state in `calculate` to avoid stale closures; `useCallback` for `calculate` with `[earningCost]`.
- State updates use functional form where it matters: `setOptions(prev => ...)`, so concurrent updates are safe.
- Pending-option support (calculate with current row without adding it) is clear and avoids duplicate state.

**Strengths**

- Ref pattern for “always latest state on click” is appropriate for event handlers.
- `calculate` is wrapped in try/catch and falls back to `setResults([])` on error, so one bad run doesn’t break the UI.
- `earningCost` default (0.67) when invalid avoids silent NaN.

**Minor**

- History save uses a hardcoded `cardType: 'premium-plus'`; it would be more accurate to pass the actual `profile` from the page (or a minimal `{ cardType, earningRate, earningCost }`) so history reflects the selected card.

**Verdict:** **Good** — Hooks are clear and robust; small improvement possible for history profile.

---

### 4.2 useProfile

- Initial state from localStorage or default preset; updates persist to storage.
- No hydration guard: first render may use default, then client may replace with stored profile. Acceptable for this app; `suppressHydrationWarning` on layout already handles attribute mismatches.

**Recommendation**

- Validate stored profile (e.g. Zod) in the initializer and when reading from storage; invalid data → fall back to default preset.

**Verdict:** **Good** — Simple and correct; add validation when touching storage.

---

## 5. Components

### 5.1 CalculatorForm

- Controlled inputs; `canCalculate` depends on cash price and either existing options or valid “new” row; comma stripping for Avios/cash is correct.
- `handleCalculate` uses `preventDefault` and `stopPropagation` to avoid accidental form submit or event bubbling.
- Accessibility: labels via `htmlFor`/`id`; good. Missing: `aria-describedby` for helper text and `aria-invalid` when validation fails (if you add validation).

**Verdict:** **Good** — Usable and accessible; optional ARIA improvements later.

---

### 5.2 SetupForm, ResultsTable, RecommendationCard

- SetupForm: Clear card selection and optional custom rate and balance; labels and structure are fine.
- ResultsTable: Uses semantic table; “Best” badge and row highlight for optimal option; recommendation colors are consistent.
- RecommendationCard: Explains the recommendation in plain language; no logic duplication with calculations.

**Verdict:** **Good** — Focused components; no major issues.

---

### 5.3 Page (app/page.tsx)

- Composes `useProfile` and `useCalculator(profile.earningCost)`; passes props explicitly. No prop drilling beyond one level.
- Scroll-into-view when results appear (effect on `calculator.results.length`) improves UX, especially on small screens.

**Verdict:** **Good** — Thin container; behavior is clear.

---

## 6. Performance

### 6.1 Bundle & Rendering

- Single page; no heavy lazy routes yet. No obvious over-fetch or large unused dependencies.
- Hooks return new object/function references each render (e.g. `calculator.calculate` is stable via `useCallback`; other returns are new). Children that depend on those (e.g. CalculatorForm) will re-render when parent re-renders, which is expected and acceptable for this size.
- No expensive computations in render; calculations run in response to user action.

**Recommendations**

- When adding more routes, use `next/dynamic` for below-the-fold or modal-heavy components.
- If results or options lists become large (e.g. 50+ rows), consider virtualisation for the table; not needed for current “few options” use case.
- Formatters (`formatCurrency`, etc.) are called in render but are cheap; no need to memoise unless profiling shows otherwise.

**Verdict:** **Good** — No performance concerns for current scope; standard Next/React practices will scale.

---

## 7. Extensibility & Adding Features

### 7.1 Adding New Card Presets

- Add an entry to `CARD_PRESETS` in `constants.ts` and extend `CardType` in `types.ts` if introducing a new preset id. Select and profile logic already iterate over presets.

**Verdict:** **Easy** — Constants-driven.

---

### 7.2 New Calculation Metrics

- Add a field to `CalculationResult` and compute it in `calculateOptionValue`; then use it in ResultsTable and RecommendationCard. Single place for formula; UI only displays.

**Verdict:** **Easy** — Result type + one function.

---

### 7.3 History UI

- `storage.getHistory()` and `CalculationHistory` type already exist. Adding a “History” page or sidebar that reads history and optionally re-applies an entry (e.g. set cash price and options from a snapshot) would be a small feature on top of current structure.

**Verdict:** **Easy** — Storage and types are ready.

---

### 7.4 Multi-currency or Different Earning Curves

- Would require new types (e.g. currency, rate table) and changes in `calculations.ts` and formatters. Current design (single currency, single rate per card) keeps the core simple; extension points are clear.

**Verdict:** **Moderate** — Possible without a full rewrite; would touch lib and types.

---

## 8. General Good Practices

### 8.1 Error Handling

- **Calculations:** try/catch in `calculate` sets results to `[]` on error; no crash.
- **Storage:** No try/catch around `JSON.parse`; malformed data can throw. Recommendation: wrap in try/catch and fall back to default or empty array.
- **No global error boundary:** For a single page this is acceptable; adding one (e.g. `app/error.tsx`) would improve resilience as the app grows.

**Recommendation:** Add storage parse guards and, later, an error boundary.

---

### 8.2 Accessibility

- Labels associated with inputs; buttons are focusable; no raw divs for click-only actions.
- Results table is semantic (`table`, `th`, `td`). Recommendation badge text is visible (not only color).
- Missing: skip link, focus management after “Calculate” (e.g. move focus to results region), and optional `aria-live` for results so screen readers announce new results. Nice-to-have, not blockers.

**Verdict:** **Adequate** — No major a11y violations; incremental improvements possible.

---

### 8.3 Security

- No server-side secrets in client code; no user-generated HTML (no `dangerouslySetInnerHTML` in app code). localStorage is used for non-sensitive preferences and history; acceptable for this use case.
- If you later add auth or personal data, keep tokens and PII out of localStorage (prefer httpOnly cookies or secure session storage and server-side checks).

**Verdict:** **Good** — No obvious issues for current scope.

---

### 8.4 Testing

- No tests in the repo. For a small app, manual testing is common, but automated tests would improve confidence and refactoring safety.
- Recommendations:
  - **Unit:** Pure functions in `lib/calculations.ts` (e.g. `calculateOptionValue`, `calculateAllOptions`) with fixed inputs and expected outputs; fast and valuable.
  - **Unit:** Storage layer with a mock or in-memory store.
  - **Integration/component:** One or two flows (e.g. set cash + option, click calculate, assert results section content) with React Testing Library.
  - **E2E (optional):** One critical path (e.g. Playwright) for “full run” confidence.

**Verdict:** **Gap** — Adding tests for calculations and one main flow would bring the project to a stronger standard.

---

### 8.5 Documentation

- README, TESTING.md, DEPLOYMENT.md, and PROJECT_SUMMARY.md exist and are useful.
- In-code: `calculations.ts` has a good worked example in comments; types have brief comments. More JSDoc on public functions (e.g. `calculate(pendingOption?)`) would help future maintainers.

**Verdict:** **Good** — Enough to onboard; expand JSDoc as you add features.

---

## 9. Dependency & Config Hygiene

- **Dependencies:** React 19, Next 16, Radix primitives, Tailwind, lucide-react, clsx, tailwind-merge, etc. All reasonable and widely used.
- **Scripts:** `dev`, `build`, `start`, `lint` are present. Consider adding `"typecheck": "tsc --noEmit"` and running it in CI.
- **ESLint:** Next config present; no custom rules observed. Consider enabling accessibility-related rules (e.g. `eslint-plugin-jsx-a11y`) if not already.

**Verdict:** **Good** — No bloat; small CI/script improvements suggested.

---

## 10. Summary Scorecard

| Area              | Rating   | Notes                                                |
|-------------------|----------|------------------------------------------------------|
| Structure         | Good     | Clear layers; easy to navigate and extend.          |
| TypeScript        | Good     | Strict; strong domain types; add validation at I/O.  |
| Core logic        | Good     | Correct; add guards for zero/undefined.             |
| State & hooks     | Good     | Sensible patterns; small history-profile tweak.     |
| Components        | Good     | Focused; adequate a11y; optional ARIA later.        |
| Performance       | Good     | Fine for current size; standard scaling options.    |
| Extensibility     | Good     | Adding presets, metrics, history is straightforward.  |
| Error handling    | Adequate | Calculation guarded; storage parse needs guard.     |
| Accessibility     | Adequate | Usable; room for focus and live region.             |
| Security          | Good     | No issues for current scope.                         |
| Testing           | Gap      | No automated tests; add unit + one flow.            |
| Documentation     | Good     | README and docs present; JSDoc can grow.             |

---

## 11. Recommended Actions (Prioritised)

### High value, low effort

1. **Guard calculations** — In `calculateOptionValue`, if `option.avios === 0` or `earningCost <= 0` or `!Number.isFinite(earningCost)`, return a safe result (e.g. zeros and `recommendation: 'poor'`) or skip the option in `calculateAllOptions`.
2. **Safe storage read** — In `storage.getProfile()` and `getHistory()`, wrap `JSON.parse` in try/catch; on error return `null` or `[]` and optionally log in development.
3. **History profile** — When saving history in `useCalculator`, pass the actual profile (or its key fields) from the parent instead of hardcoded `'premium-plus'`.

### Medium value

4. **Add unit tests** — For `calculateOptionValue` and `calculateAllOptions` (and optionally formatters) with a few input/output pairs.
5. **Optional: Zod (or similar)** — Validate profile and history shape when reading from localStorage; reject invalid data and use defaults.
6. **`app/error.tsx`** — Simple error boundary so a single component error doesn’t blank the whole app.

### Lower priority

7. **JSDoc** — For public functions in `lib/` and hook return values.
8. **A11y** — `aria-live` for results, focus move to results after Calculate, and/or skip link.
9. **Scripts** — `"typecheck": "tsc --noEmit"` and run in CI.

---

## Conclusion

The Avios Optimizer is in good shape for production: clear structure, solid types, correct core logic, and sensible state and UI patterns. The main improvements are defensive (calculation guards, safe storage parsing), better history fidelity (real profile in history), and adding tests and optional validation. Addressing the high-value, low-effort items will make the codebase more robust and easier to extend with features like history UI, new presets, and new metrics.

---

## Implemented Recommendations (Post-Review)

The following items from §11 have been implemented:

- **Unit tests** — Jest + ts-jest; `__tests__/lib/calculations.test.ts` (calculateOptionValue, calculateAllOptions, formatters) and `__tests__/lib/storage.test.ts` (Zod schema validation). Run: `npm run test`, `npm run test:coverage`.
- **Zod validation** — `src/lib/validation.ts` defines schemas for UserProfile and CalculationHistory; `storage.getProfile()` and `storage.getHistory()` use safeParse and return null/[] on invalid data.
- **Error boundary** — `app/error.tsx` catches segment errors and offers "Try again" (reset).
- **JSDoc** — Public functions in `lib/calculations.ts`, `lib/utils.ts`, and hooks `useCalculator` and `useProfile` have JSDoc (params, returns, examples where useful).
- **A11y** — Skip link ("Skip to results" to `#results`), results region with `aria-live="polite"`, `aria-label="Calculation results"`, `role="region"`, and focus moved to results after calculate (results container has `tabIndex={-1}` and is focused in the existing useEffect).
- **Scripts** — `typecheck` and `test` / `test:watch` / `test:coverage` in package.json.
