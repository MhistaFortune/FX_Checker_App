import { useEffect, useState } from 'react';
import Header from './components/Header';
import Ticker from './features/ticker/components/Ticker';
import Converter from './features/converter/components/Converter';
import { Tabs, Tab } from './features/tabs/components/Tabs';
import { CurrencyPicker } from './features/currency-picker/components/CurrencyPicker';
import { RateHistory } from './features/rate-history/components/RateHistory';
import { Compare } from './features/compare/components/Compare';
import { Favorites } from './features/favorites/components/Favorites';
import { ConversionLog } from './features/conversion-log/components/ConversionLog';
import { fetchCurrencies, fetchLatestRates, fetchRatesForDate } from './services/api';
import type { CurrencyMap, PinnedPair } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

type PickerType = 'from' | 'to' | null;

interface LogEntry {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  amount: number;
  result: number;
}

function App() {
  const [currencies, setCurrencies] = useState<CurrencyMap>({});
  const [, setLoadingCurrencies] = useState(true);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1000);
  const [latestRates, setLatestRates] = useState<{ [key: string]: number }>({});
  const [latestRateDate, setLatestRateDate] = useState<string>();
  const [favorites, setFavorites] = useLocalStorage<PinnedPair[]>('fx-checker-favorites', []);
  const [log, setLog] = useLocalStorage<LogEntry[]>('fx-checker-log', []);
  const [openPicker, setOpenPicker] = useState<PickerType>(null);

  const [eurLatestRates, setEurLatestRates] = useState<{ [key: string]: number }>({});
  const [eurYesterdayRates, setEurYesterdayRates] = useState<{ [key: string]: number }>({});
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('fx-checker-theme', 'dark');

  const isFavorite = favorites.some(pair => pair.from === fromCurrency && pair.to === toCurrency);
  const latestRate = latestRates[toCurrency];

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    async function loadEurRates() {
      try {
        console.log('Fetching EUR latest rates...');
        const latestResponse = await fetchLatestRates('EUR');
        console.log('EUR latest response:', latestResponse);
        const latestRatesMap = { ...latestResponse.rates, EUR: 1 };
        setEurLatestRates(latestRatesMap);
        console.log('Set eurLatestRates:', latestRatesMap);

        // Fetch yesterday's rates
        let currentDate = new Date(latestResponse.date);
        let yesterdayRatesMap: Record<string, number> = {};
        
        // Try up to 10 days back to find a valid date
        for (let i = 0; i < 10; i++) {
          currentDate.setDate(currentDate.getDate() - 1);
          const dateStr = currentDate.toISOString().split('T')[0];
          console.log('Trying historical date:', dateStr);
          try {
            const histResponse = await fetchRatesForDate(dateStr, 'EUR');
            console.log('Got historical response:', histResponse);
            yesterdayRatesMap = { ...histResponse.rates, EUR: 1 };
            break;
          } catch (error) {
            console.error('Error fetching historical rates for', dateStr, ':', error);
            // Keep trying previous day
          }
        }
        setEurYesterdayRates(yesterdayRatesMap);
        console.log('Set eurYesterdayRates:', yesterdayRatesMap);
      } catch (err) {
        console.error('Failed to load EUR base rates:', err);
      }
    }
    loadEurRates();
  }, []);

  useEffect(() => {
    async function loadCurrencies() {
      try {
        const data = await fetchCurrencies();
        setCurrencies(data);
      } catch (err) {
        console.error('Failed to load currencies list:', err);
      } finally {
        setLoadingCurrencies(false);
      }
    }
    loadCurrencies();
  }, []);

  useEffect(() => {
    async function loadLatestRates() {
      try {
        const data = await fetchLatestRates(fromCurrency);
        // Add the base currency to rates with value 1
        const newRates = { ...data.rates, [fromCurrency]: 1 };
        setLatestRates(newRates);
        setLatestRateDate(data.date);
      } catch (err) {
        console.error('Failed to load latest rates:', err);
      }
    }
    loadLatestRates();
  }, [fromCurrency]);

  const handleSwap = () => {
    // Use a temporary variable to avoid using stale state
    const newFromCurrency = toCurrency;
    const newToCurrency = fromCurrency;
    setFromCurrency(newFromCurrency);
    setToCurrency(newToCurrency);
  };

  const handleToggleFavorite = (from = fromCurrency, to = toCurrency) => {
    const exists = favorites.some(pair => pair.from === from && pair.to === to);
    if (exists) {
      setFavorites(favorites.filter(pair => !(pair.from === from && pair.to === to)));
    } else {
      setFavorites([...favorites, { from, to }]);
    }
  };

  const handleLogConversion = () => {
    if (latestRate) {
      const entry: LogEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        from: fromCurrency,
        to: toCurrency,
        amount,
        result: amount * latestRate
      };
      setLog([...log, entry]);
    }
  };

  const handleSelectFavorite = (from: string, to: string) => {
    setFromCurrency(from);
    setToCurrency(to);
  };

  const handleClearLog = () => {
    setLog([]);
  };

  const handleDeleteEntry = (id: string) => {
    setLog(log.filter(entry => entry.id !== id));
  };

  const currencyCount = Object.keys(currencies).length;

  const handleSelectCurrency = (currency: string) => {
    if (openPicker === 'from') {
      setFromCurrency(currency);
    } else if (openPicker === 'to') {
      setToCurrency(currency);
    }
  };

  return (
    <>
      <div className="container">
        <Header
          currencyCount={currencyCount}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
      </div>
      
      <Ticker
        eurLatestRates={eurLatestRates}
        eurYesterdayRates={eurYesterdayRates}
      />
      
      <div className="container">
        <h2 className="converter-heading">CHECK THE RATE</h2>
        <Converter
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          amount={amount}
          onAmountChange={setAmount}
          onOpenFromCurrencyPicker={() => setOpenPicker('from')}
          onOpenToCurrencyPicker={() => setOpenPicker('to')}
          onSwap={handleSwap}
          onToggleFavorite={handleToggleFavorite}
          onLogConversion={handleLogConversion}
          isFavorite={isFavorite}
          latestRate={latestRate}
          latestRateDate={latestRateDate}
        />
        
        <Tabs>
          <Tab label="HISTORY">
            <RateHistory
              fromCurrency={fromCurrency}
              toCurrency={toCurrency}
            />
          </Tab>
          <Tab label="COMPARE">
            <Compare
              fromCurrency={fromCurrency}
              amount={amount}
              currencies={currencies}
              latestRates={latestRates}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          </Tab>
          <Tab label="FAVORITES">
            <Favorites
              favorites={favorites}
              eurLatestRates={eurLatestRates}
              eurYesterdayRates={eurYesterdayRates}
              onSelectPair={handleSelectFavorite}
              onRemoveFavorite={handleToggleFavorite}
            />
          </Tab>
          <Tab label="LOG">
            <ConversionLog
              log={log}
              onClearLog={handleClearLog}
              onDeleteEntry={handleDeleteEntry}
            />
          </Tab>
        </Tabs>
      </div>

      <CurrencyPicker
        isOpen={openPicker !== null}
        onClose={() => setOpenPicker(null)}
        onSelect={handleSelectCurrency}
        selectedCurrency={openPicker === 'from' ? fromCurrency : toCurrency}
        currencies={currencies}
      />
    </>
  );
}

export default App;
export { App };
