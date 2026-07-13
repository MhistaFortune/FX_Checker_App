import { useState, useEffect } from 'react';
import { getFlagUrl } from '../../../utils/flags';
import iconExchange from '../../../assets/images/icon-exchange.svg';
import iconExchangeVertical from '../../../assets/images/icon-exchange-vertical.svg';
import iconStar from '../../../assets/images/icon-star.svg';
import iconStarFilled from '../../../assets/images/icon-star-filled.svg';

interface ConverterProps {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  onAmountChange: (amount: number) => void;
  onOpenFromCurrencyPicker: () => void;
  onOpenToCurrencyPicker: () => void;
  onSwap: () => void;
  onToggleFavorite: () => void;
  onLogConversion: () => void;
  isFavorite: boolean;
  latestRate?: number;
  latestRateDate?: string;
}

export function Converter({
  fromCurrency,
  toCurrency,
  amount,
  onAmountChange,
  onOpenFromCurrencyPicker,
  onOpenToCurrencyPicker,
  onSwap,
  onToggleFavorite,
  onLogConversion,
  isFavorite,
  latestRate,
  latestRateDate
}: ConverterProps) {
  const convertedAmount = latestRate ? amount * latestRate : 0;
  const [isStacked, setIsStacked] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsStacked(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="converter">
      <div className="converter-container">
        {/* From Currency */}
        <div className="converter-column from">
          <label className="converter-label">SEND</label>
          <div className="converter-input-group">
            <input
              type="number"
              className="converter-input"
              value={amount}
              onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <button
              type="button"
              className="currency-selector"
              onClick={onOpenFromCurrencyPicker}
            >
              <img
                src={getFlagUrl(fromCurrency)}
                alt={`${fromCurrency} flag`}
                className="currency-flag"
              />
              <span className="currency-code">{fromCurrency}</span>
              <span className="currency-chevron"></span>
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="converter-swap">
          <button
            type="button"
            className="swap-button"
            onClick={onSwap}
            aria-label="Swap currencies"
          >
            <img src={isStacked ? iconExchangeVertical : iconExchange} alt="" />
          </button>
        </div>

        {/* To Currency */}
        <div className="converter-column to">
          <label className="converter-label">RECEIVE</label>
          <div className="converter-input-group">
            <input
              type="text"
              className="converter-input receive-input"
              value={convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              readOnly
              placeholder="0.00"
            />
            <button
              type="button"
              className="currency-selector"
              onClick={onOpenToCurrencyPicker}
            >
              <img
                src={getFlagUrl(toCurrency)}
                alt={`${toCurrency} flag`}
                className="currency-flag"
              />
              <span className="currency-code">{toCurrency}</span>
              <span className="currency-chevron"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Rate Info and Actions */}
      <div className="converter-footer">
        <div className="rate-info">
          {latestRate && latestRateDate && (
            <p className="rate-text">
              1 {fromCurrency} = {latestRate.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {toCurrency}
            </p>
          )}
        </div>
        <div className="converter-actions">
          <button
            type="button"
            className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <img src={isFavorite ? iconStarFilled : iconStar} alt="" />
            <span>{isFavorite ? 'FAVORITED' : 'FAVORITE'}</span>
          </button>
          <button
            type="button"
            className="log-button"
            onClick={onLogConversion}
          >
            LOG CONVERSION
          </button>
        </div>
      </div>
    </section>
  );
}

export default Converter;
