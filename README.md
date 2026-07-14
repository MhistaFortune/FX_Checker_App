# FX Checker - Foreign Exchange Checker App

## Overview

This is a **premium-quality, portfolio-ready currency converter and foreign exchange tracking app**, built as part of the **Frontend Mentor 30-Day Hackathon**. It features a sleek, dark-first design, real-time exchange rates, historical data visualization, multi-currency comparison, favorite pairs, and conversion history logging—all with full accessibility and responsive design.

## Features Implemented

### Core Converter
- **Real-time conversion**: Enter an amount and see it update instantly as you type
- **Currency picker**: Searchable list with flag, code, and full name; grouped into "Popular" and "All currencies"
- **Live rate display**: Shows the current exchange rate (e.g., 1 USD = 0.8530 EUR)
- **Swap button**: One-click to reverse send/receive currencies
- **Toggle favorite**: Mark/unmark the active pair as a favorite
- **Log conversion**: Save the current conversion to your history

### Live Markets Ticker
- Horizontal scrollable ticker
- Displays popular currency pairs
- Shows current rate and 24hr change (green for up, red for down)

### Rate History
- Interactive area/line chart powered by **Recharts**
- Time range selector: 1D, 1W, 1M, 3M, 1Y, and 5Y
- Displays Open, Last, Absolute Change, and Percentage Change
- Error state if history fails to load

### Compare
- Shows your send amount converted into all available currencies at once
- Pin/unpin any pair to/from favorites directly from the comparison view
- Reference rate for each currency

### Favorites
- Saved pairs persist across browser sessions (using `localStorage`)
- Load a pair into the converter by clicking it
- Remove pairs you no longer want to track
- Shows live rate and 24hr change for each favorite

### Conversion Log
- Complete history of all your conversions
- Shows relative time, currency pair, and send/receive amounts
- Delete individual log entries or clear the entire log

### UI & Accessibility
- **Dark-first design** with light theme toggle (persists across sessions)
- Fully responsive, works on all screen sizes
- Hover and focus states for all interactive elements
- 100% keyboard-navigable
- Semantic HTML for screen readers
- Custom focus rings (important for dark interfaces)

### Data Persistence
- Favorites and conversion log are stored in `localStorage`
- Last active currency pair is saved in the URL for sharing/bookmarking

## Tech Stack
- **React 19** with TypeScript
- **Vite** for lightning-fast development/builds
- **Recharts** for data visualization
- **Lucide React** for icons
- **Frankfurter API** (free, no API key, no rate limits) for:
  - Currency list
  - Latest exchange rates
  - Historical time-series data
- **ExchangeRate-API** (free tier with API key) for:
  - Expanded currency list (fallback for Frankfurter's smaller set)
  - Latest rates (fallback if Frankfurter is unavailable)

## Project Structure
```
Foreign Exchange Checker App/
├─ src/
│  ├─ components/
│  │  └─ Header.tsx                  # App header with theme toggle and meta info
│  ├─ data/
│  │  └─ currencies.ts               # Comprehensive currency name database
│  ├─ features/
│  │  ├─ currency-picker/
│  │  │  └─ components/
│  │  │     └─ CurrencyPicker.tsx    # Searchable currency selection modal
│  │  ├─ tabs/
│  │  │  └─ components/
│  │  │     └─ Tabs.tsx              # Tab navigation between History/Compare/Favorites/Log
│  │  ├─ converter/
│  │  │  └─ components/
│  │  │     └─ Converter.tsx         # Main conversion UI
│  │  ├─ rate-history/
│  │  │  └─ components/
│  │  │     └─ RateHistory.tsx       # Historical chart and stats
│  │  ├─ compare/
│  │  │  └─ components/
│  │  │     └─ Compare.tsx           # Multi-currency comparison view
│  │  ├─ favorites/
│  │  │  └─ components/
│  │  │     └─ Favorites.tsx         # Saved pairs list
│  │  └─ conversion-log/
│  │     └─ components/
│  │        └─ ConversionLog.tsx     # Conversion history UI
│  ├─ hooks/
│  │  └─ useLocalStorage.ts          # Custom hook for localStorage state persistence
│  ├─ services/
│  │  └─ api.ts                      # API client (Frankfurter + ExchangeRate-API)
│  ├─ utils/
│  │  └─ flags.ts                    # Helper to get flag URLs from currency codes
│  ├─ App.tsx                        # Main app component with state management
│  ├─ main.tsx                       # React entry point
│  └─ index.css                      # Global styles and design tokens
├─ index.html                        # Root HTML file
├─ vite.config.ts                    # Vite configuration
├─ tsconfig.json                     # TypeScript config
├─ package.json                      # Dependencies and scripts
└─ README.md                         # This file!
```

## Challenges Encountered & Solutions

### 1. Merging Currency Data from Two APIs
**Problem**: Frankfurter has a great API but only supports ~30 major currencies. ExchangeRate-API supports 160+ but only returns currency codes, not names.
**Solution**: 
- Created `src/data/currencies.ts` with a comprehensive database of currency names
- In `api.ts`, merged Frankfurter's currency names, our custom data, and ExchangeRate-API's codes
- So users get the expanded currency list with proper names for all currencies!

### 2. Recharts Cursor Component Error
**Problem**: Tried to import and use `Cursor` from Recharts, but the version in the project didn't export it!
**Solution**: 
- Removed the `Cursor` import
- Kept the Tooltip which still provides interactive hover info
- Simplified the chart slightly without losing functionality

### 3. Unused Variable TypeScript Error
**Problem**: Had an unused `allCurrencies` variable in `CurrencyPicker.tsx`, causing build errors.
**Solution**: Just removed the unnecessary variable!

### 4. White/Blank Screen on Initial Load
**Problem**: Initial page load was completely white!
**Solution**: Tracked it down to the Recharts Cursor import error. Fixed that, and the app loaded perfectly!

## Installation & Usage

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn or pnpm

### Installation
```bash
# Clone or download the project
cd "Foreign Exchange Checker App"
npm install
```

### Development
```bash
npm run dev
# Open http://localhost:5173 (or whatever port Vite uses)
```

### Build for Production
```bash
npm run build
# Output in `dist/` folder
```

### Preview Production Build
```bash
npm run preview
```

## API Notes

### Frankfurter API (Primary)
- **Base URL**: `https://api.frankfurter.dev/v1`
- **Endpoints used**:
  - `GET /currencies`: Fetch supported currencies with names
  - `GET /latest?base=XXX`: Get latest rates for base currency
  - `GET /{start}..{end}?base=XXX&symbols=YYY`: Fetch historical time-series
- **No API key needed!**

### ExchangeRate-API (Fallback)
- **Base URL**: `https://v6.exchangerate-api.com/v6/YOUR_API_KEY`
- **Endpoints used**:
  - `GET /latest/USD`: Get latest rates (and currency codes)
- **Note**: API key is included in the project for demo purposes, you should replace it with your own for production!

## Future Enhancements (Ideas)
- Add CSV export for the conversion log
- Add crosshair to the rate history chart
- Implement rate caching with offline fallback
- Add keyboard shortcuts for common actions
- Build a backend for user accounts and cross-device sync

## Credits
- Design and challenge by [Frontend Mentor](https://www.frontendmentor.io)
- Built as part of the FM30 Hackathon
- Exchange rates provided by [Frankfurter](https://frankfurter.dev) and [ExchangeRate-API](https://www.exchangerate-api.com)
- Font: JetBrains Mono

## License
MIT License - feel free to use this as a portfolio project!

---
**Have fun with FX Checker!** 🚀
