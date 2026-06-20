import { useEffect, useState } from 'react';
import { fetchLatestRates } from '../services/api';
import { CurrencyPicker } from './CurrencyPicker';
import type { LatestRatesResponse, ConversionLogEntry, PinnedPair } from '../types';

interface ConverterProps {
  fromCurrency: string;
  toCurrency: string;
  onSwap: () => void;
  onCurrencyChange: (from: string, to: string) => void;
  onFavorite: (from: string, to: string, isFavorited: boolean) => void;
  onLog: (entry: ConversionLogEntry) => void;
  isFavorited: boolean;
  onSendAmountChange?: (amount: string) => void;
}

export function Converter({
  fromCurrency,
  toCurrency,
  onSwap,
  onCurrencyChange,
  onFavorite,
  onLog,
  isFavorited,
  onSendAmountChange,
}: ConverterProps) {
  const [sendAmount, setSendAmount] = useState('1000');
  const [receiveAmount, setReceiveAmount] = useState('0');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fromCurrency || !toCurrency || !sendAmount) {
      return;
    }

    setLoading(true);
    setError(null);

    fetchLatestRates(fromCurrency, [toCurrency])
      .then((data: LatestRatesResponse) => {
        const rate = data.rates[toCurrency];
        if (rate !== undefined) {
          setExchangeRate(rate);
          const converted = Number(sendAmount) * rate;
          setReceiveAmount(converted.toFixed(2));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch rates:', err);
        setError('Failed to load exchange rate');
      })
      .finally(() => setLoading(false));
  }, [fromCurrency, toCurrency, sendAmount]);

  const handleSendAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSendAmount(value);
    if (onSendAmountChange) {
      onSendAmountChange(value);
    }
  };

  const handleLogConversion = () => {
    if (!sendAmount || !exchangeRate) return;

    const entry: ConversionLogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      from: fromCurrency,
      to: toCurrency,
      amount: Number(sendAmount),
      result: Number(receiveAmount),
    };

    onLog(entry);
  };

  const handleFavorite = () => {
    onFavorite(fromCurrency, toCurrency, !isFavorited);
  };

  return (
    <div className="converter-section">
      <h2 className="converter-header">CHECK THE RATE</h2>

      <div className="converter-body">
        <div className="currency-box">
          <label className="currency-box-label">SEND</label>
          <input
            type="number"
            className="currency-box-amount"
            value={sendAmount}
            onChange={handleSendAmountChange}
            placeholder="Enter amount"
          />
          <CurrencyPicker
            value={fromCurrency}
            onChange={(code) => onCurrencyChange(code, toCurrency)}
            title="Send Currency"
          />
        </div>

        <button className="swap-button" onClick={onSwap} aria-label="Swap currencies" title="Swap">
          ⇅
        </button>

        <div className="currency-box">
          <label className="currency-box-label">RECEIVE</label>
          <div className="currency-box-amount receive">{Number(receiveAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <CurrencyPicker
            value={toCurrency}
            onChange={(code) => onCurrencyChange(fromCurrency, code)}
            title="Receive Currency"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {exchangeRate && (
        <div className="exchange-rate">
          <span>1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}</span>
          <div className="converter-actions">
            <button
              className={`btn-primary ${isFavorited ? 'favorited' : ''}`}
              onClick={handleFavorite}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              ★ {isFavorited ? 'FAVORITED' : 'FAVORITE'}
            </button>
            <button className="btn-secondary" onClick={handleLogConversion}>
              LOG CONVERSION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
