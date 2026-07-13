import { useState, useMemo, useEffect, useRef } from 'react';
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
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleKeyDown = (e: React.KeyboardEvent, code: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(code);
    }
  };

  const allCurrencies = [...popularCurrencies, ...otherCurrencies];

  return (
    <div 
      className="currency-picker-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="currency-picker-title"
    >
      <div 
        className="currency-picker" 
        onClick={(e) => e.stopPropagation()}
        ref={pickerRef}
      >
        <div className="currency-picker-header">
          <h2 id="currency-picker-title" className="currency-picker-title">Select Currency</h2>
          <button 
            type="button" 
            className="currency-picker-close" 
            onClick={onClose}
            aria-label="Close currency picker"
          >
            ×
          </button>
        </div>

        <div className="currency-picker-search">
          <input
            ref={searchInputRef}
            type="text"
            className="currency-picker-input"
            placeholder="Search currencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search currencies"
          />
        </div>

        <div className="currency-picker-list" role="listbox" aria-label="Currency list">
          {popularCurrencies.length > 0 && (
            <>
              <div className="currency-section-title" role="presentation">Popular</div>
              {popularCurrencies.map(([code, name]) => (
                <button
                  key={code}
                  type="button"
                  className={`currency-item ${code === selectedCurrency ? 'selected' : ''}`}
                  onClick={() => handleSelect(code)}
                  onKeyDown={(e) => handleKeyDown(e, code)}
                  role="option"
                  aria-selected={code === selectedCurrency}
                >
                  {getFlagUrl(code) ? (
                    <img
                      src={getFlagUrl(code)}
                      alt={`${code} flag`}
                      className="currency-item-flag"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="currency-item-flag currency-item-flag-placeholder" aria-hidden="true">{code.substring(0, 2)}</div>
                  )}
                  <div className="currency-item-info">
                    <div className="currency-item-code">{code}</div>
                    <div className="currency-item-name">{name}</div>
                  </div>
                  {code === selectedCurrency && (
                    <span className="currency-item-check" aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </>
          )}

          {otherCurrencies.length > 0 && (
            <>
              <div className="currency-section-title" role="presentation">All Currencies</div>
              {otherCurrencies.map(([code, name]) => (
                <button
                  key={code}
                  type="button"
                  className={`currency-item ${code === selectedCurrency ? 'selected' : ''}`}
                  onClick={() => handleSelect(code)}
                  onKeyDown={(e) => handleKeyDown(e, code)}
                  role="option"
                  aria-selected={code === selectedCurrency}
                >
                  {getFlagUrl(code) ? (
                    <img
                      src={getFlagUrl(code)}
                      alt={`${code} flag`}
                      className="currency-item-flag"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="currency-item-flag currency-item-flag-placeholder" aria-hidden="true">{code.substring(0, 2)}</div>
                  )}
                  <div className="currency-item-info">
                    <div className="currency-item-code">{code}</div>
                    <div className="currency-item-name">{name}</div>
                  </div>
                  {code === selectedCurrency && (
                    <span className="currency-item-check" aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
