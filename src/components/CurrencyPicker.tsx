import { useState, useEffect } from 'react';
import type { Currency } from '../types';
import { fetchCurrencies } from '../services/api';

interface CurrencyPickerProps {
  value: string;
  onChange: (code: string) => void;
  title?: string;
}

export function CurrencyPicker({ value, onChange, title = 'Select Currency' }: CurrencyPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currencies.length > 0 || loading) return;

    setLoading(true);
    fetchCurrencies()
      .then((currencyMap) => {
        const currencyList = Object.entries(currencyMap).map(([code, name]) => ({
          code,
          name,
        }));
        setCurrencies(currencyList.sort((a, b) => a.code.localeCompare(b.code)));
      })
      .catch((err) => {
        console.error('Failed to fetch currencies:', err);
        setError('Failed to load currencies');
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedCurrency = currencies.find((c) => c.code === value);
  const popularCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
  const popular = currencies.filter((c) => popularCodes.includes(c.code));
  const other = currencies.filter((c) => !popularCodes.includes(c.code));

  const filtered = search
    ? currencies.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const displayList = filtered || currencies;

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="currency-picker">
      <button
        className="currency-picker-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select currency"
      >
        {selectedCurrency ? (
          <>
            <span className="currency-flag" data-code={selectedCurrency.code}></span>
            <span>{selectedCurrency.code}</span>
          </>
        ) : (
          <span>Select Currency</span>
        )}
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>{title}</span>
              <button
                className="modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              className="search-input"
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="empty-state">
                <div>Loading currencies...</div>
              </div>
            ) : (
              <div className="currency-list">
                {!search && popular.length > 0 && (
                  <>
                    <div className="currency-group-title">Popular</div>
                    {popular.map((currency) => (
                      <button
                        key={currency.code}
                        className="currency-item"
                        onClick={() => handleSelect(currency.code)}
                      >
                        <span className="currency-flag" data-code={currency.code}></span>
                        <div className="currency-info">
                          <div className="currency-code">{currency.code}</div>
                          <div className="currency-name">{currency.name}</div>
                        </div>
                        {value === currency.code && <div className="currency-check">✓</div>}
                      </button>
                    ))}
                  </>
                )}

                {!search && other.length > 0 && (
                  <>
                    <div className="currency-group-title">Other Currencies</div>
                    {other.map((currency) => (
                      <button
                        key={currency.code}
                        className="currency-item"
                        onClick={() => handleSelect(currency.code)}
                      >
                        <span className="currency-flag" data-code={currency.code}></span>
                        <div className="currency-info">
                          <div className="currency-code">{currency.code}</div>
                          <div className="currency-name">{currency.name}</div>
                        </div>
                        {value === currency.code && <div className="currency-check">✓</div>}
                      </button>
                    ))}
                  </>
                )}

                {search && displayList.length > 0 && (
                  <>
                    <div className="currency-group-title">Results</div>
                    {displayList.map((currency) => (
                      <button
                        key={currency.code}
                        className="currency-item"
                        onClick={() => handleSelect(currency.code)}
                      >
                        <span className="currency-flag" data-code={currency.code}></span>
                        <div className="currency-info">
                          <div className="currency-code">{currency.code}</div>
                          <div className="currency-name">{currency.name}</div>
                        </div>
                        {value === currency.code && <div className="currency-check">✓</div>}
                      </button>
                    ))}
                  </>
                )}

                {search && displayList.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-text">No currencies found</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
