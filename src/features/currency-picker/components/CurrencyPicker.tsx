import { useState, useMemo, useEffect } from 'react';
import { getFlagUrl } from '../../../utils/flags';

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];

interface CurrencyPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: string) => void;
  selectedCurrency: string;
  currencies: Record<string, string>;
}

export function CurrencyPicker({
  isOpen,
  onClose,
  onSelect,
  selectedCurrency,
  currencies,
}: CurrencyPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredCurrencies = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return Object.entries(currencies).filter(([code, name]) => {
      return code.toLowerCase().includes(query) || name.toLowerCase().includes(query);
    });
  }, [currencies, searchQuery]);

  const popularCurrencies = useMemo(() => {
    return filteredCurrencies.filter(([code]) => POPULAR_CURRENCIES.includes(code));
  }, [filteredCurrencies]);

  const otherCurrencies = useMemo(() => {
    return filteredCurrencies.filter(([code]) => !POPULAR_CURRENCIES.includes(code));
  }, [filteredCurrencies]);

  if (!isOpen) return null;

  const handleSelect = (code: string) => {
    onSelect(code);
    onClose();
  };

  return (
    <div className="currency-picker-overlay" onClick={onClose}>
      <div className="currency-picker" onClick={(e) => e.stopPropagation()}>
        <div className="currency-picker-header">
          <h2 className="currency-picker-title">Select Currency</h2>
          <button type="button" className="currency-picker-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="currency-picker-search">
          <input
            type="text"
            className="currency-picker-input"
            placeholder="Search currencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="currency-picker-list">
          {popularCurrencies.length > 0 && (
            <>
              <div className="currency-section-title">Popular</div>
              {popularCurrencies.map(([code, name]) => (
                <div
                  key={code}
                  className={`currency-item ${code === selectedCurrency ? 'selected' : ''}`}
                  onClick={() => handleSelect(code)}
                >
                  <img
                    src={getFlagUrl(code)}
                    alt={`${code} flag`}
                    className="currency-item-flag"
                  />
                  <div className="currency-item-info">
                    <div className="currency-item-code">{code}</div>
                    <div className="currency-item-name">{name}</div>
                  </div>
                  {code === selectedCurrency && (
                    <span className="currency-item-check">✓</span>
                  )}
                </div>
              ))}
            </>
          )}

          {otherCurrencies.length > 0 && (
            <>
              <div className="currency-section-title">All Currencies</div>
              {otherCurrencies.map(([code, name]) => (
                <div
                  key={code}
                  className={`currency-item ${code === selectedCurrency ? 'selected' : ''}`}
                  onClick={() => handleSelect(code)}
                >
                  <img
                    src={getFlagUrl(code)}
                    alt={`${code} flag`}
                    className="currency-item-flag"
                  />
                  <div className="currency-item-info">
                    <div className="currency-item-code">{code}</div>
                    <div className="currency-item-name">{name}</div>
                  </div>
                  {code === selectedCurrency && (
                    <span className="currency-item-check">✓</span>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
