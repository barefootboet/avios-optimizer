# Avios Optimizer

A production-ready web application that helps users optimize British Airways Avios redemptions by comparing different Avios+cash combinations.

![Avios Optimizer](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## Overview

When booking British Airways flights with Avios, users face multiple payment options like:
- 43,000 Avios + £169.40
- 32,000 Avios + £269.20
- 25,600 Avios + £337.60

This app calculates which option gives the best "value per Avios" based on your earning rate, helping you make informed decisions about your Avios redemptions.

## Features

- **Smart Calculations**: Calculate value per Avios and profit margins for each option
- **Optimal Recommendations**: Automatically identifies the best option based on total cost
- **Card Profiles**: Pre-configured profiles for BA Premium Plus and Free cards
- **Custom Earning Rates**: Support for custom earning rates
- **Persistent Storage**: Saves your preferences and calculation history in localStorage
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode**: Full dark mode support
- **TypeScript**: Fully typed for better developer experience

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Storage**: localStorage

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd avios-optimizer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Set Up Your Profile

Select your BA credit card type:
- **BA Premium Plus**: 1.5 Avios per £1 (0.67p earning cost)
- **BA Free Card**: 1 Avios per £1 (1p earning cost)
- **Custom**: Enter your own earning rate

Optionally add your current Avios balance to track remaining points.

### 2. Enter Trip Details

- Enter the **cash price** for the flight (total for all passengers)
- Specify the **number of people** traveling
- Add multiple **Avios + cash options** you're comparing

### 3. Calculate & Compare

Click "Calculate Best Value" to see:
- **Value per Avios** for each option (in pence)
- **Profit margin** compared to your earning cost
- **Total cost** (cash + opportunity cost of Avios)
- **Recommendation rating** (excellent, good, ok, poor)
- **Best option** highlighted with explanation

## Calculation Logic

### Value per Avios
```
Value per Avios = (Cash Saved ÷ Avios Used) × 100
```

### Profit Margin
```
Profit Margin = ((Value per Avios ÷ Earning Cost) - 1) × 100
```

### Total Cost
```
Total Cost = Cash Paid + (Avios Used × Earning Cost ÷ 100)
```

### Example

For a £850 flight with the option of 43,000 Avios + £169.40:
- **Cash Saved**: £850 - £169.40 = £680.60
- **Value per Avios**: (£680.60 ÷ 43,000) × 100 = 1.58p
- **Profit Margin** (0.67p earning cost): (1.58 ÷ 0.67 - 1) × 100 = +136%
- **Total Cost**: £169.40 + (43,000 × 0.67p) = £457.81

## Project Structure

```
avios-optimizer/
├── app/
│   ├── page.tsx              # Main calculator page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── src/
│   ├── components/
│   │   ├── calculator/       # Calculator components
│   │   │   ├── SetupForm.tsx
│   │   │   ├── CalculatorForm.tsx
│   │   │   ├── ResultsTable.tsx
│   │   │   └── RecommendationCard.tsx
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/
│   │   ├── useProfile.ts     # User profile management
│   │   └── useCalculator.ts  # Calculator logic
│   └── lib/
│       ├── types.ts          # TypeScript types
│       ├── constants.ts      # Card presets & thresholds
│       ├── calculations.ts   # Core calculation logic
│       ├── storage.ts        # localStorage abstraction
│       └── utils.ts          # Utility functions
├── package.json
└── tsconfig.json
```

## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Testing with Real Data

Test the calculator with these inputs:

**Input:**
- Card: BA Premium Plus (0.67p earning cost)
- Cash price: £850 (for 2 people)
- Number of people: 2
- Options:
  - 43,000 Avios + £169.40
  - 32,000 Avios + £269.20
  - 25,600 Avios + £337.60

**Expected Results:**

Option 2 (32,000 Avios + £269.20) should be marked as "Best":
- Cash saved: £580.80
- Value per Avios: 1.82p
- Profit margin: +172%
- Total cost: £483.60
- Recommendation: Excellent

## Key Features Explained

### Recommendation Thresholds

- **Excellent**: ≥150% profit margin
- **Good**: ≥50% profit margin
- **OK**: ≥0% profit margin (break-even or better)
- **Poor**: <0% profit margin (worse than earning cost)

### Optimal Selection

The app identifies the "optimal" option as the one with the **lowest total cost** among all options with a **positive profit margin** (≥0%).

### Persistent Storage

User preferences and calculation history are automatically saved to localStorage:
- Last 20 calculations are stored
- Profile settings persist across sessions
- No server or database required

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## Support

For issues or questions, please open an issue on GitHub.

---

**Happy Avios optimizing!** ✈️
