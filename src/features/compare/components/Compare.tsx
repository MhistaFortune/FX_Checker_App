import { getFlagUrl } from '../../../utils/flags';
import iconStar from '../../../assets/images/icon-star.svg';
import iconStarFilled from '../../../assets/images/icon-star-filled.svg';

interface CompareProps {
  fromCurrency: string;
  amount: number;
  currencies: Record<string, string>;
  latestRates: Record<string, number>;
  favorites: Array<{ from: string; to: string }>;
  onToggleFavorite: (from: string, to: string) => void;
}

export function Compare({
  fromCurrency,
  amount,
  currencies,
  latestRates,
  favorites,
  onToggleFavorite
}: CompareProps) {
  const availableCurrencies = Object.entries(currencies).filter(
    ([code]) => code !== fromCurrency
  );

  if (!amount || amount <= 0) {
    return (
      <div className="compare-empty">
        <p>Enter an amount in the converter above to compare rates</p>
      </div>
    );
  }

  const isFavorite = (to: string) =>
    favorites.some(pair => pair.from === fromCurrency && pair.to === to);

  return (
    <div>
      <div className="compare-grid">
        {availableCurrencies.map(([code, name]) => {
          const rate = latestRates[code];
          const converted = rate ? amount * rate : 0;

          return (
            <div key={code} className="compare-item">
              <div className="compare-info">
                <div className="compare-flags">
                  <img
                    src={getFlagUrl(fromCurrency)}
                    alt={fromCurrency}
                    className="compare-flag"
                  />
                  <img
                    src={getFlagUrl(code)}
                    alt={code}
                    className="compare-flag second"
                  />
                </div>
                <div className="compare-pair">
                  <div className="compare-code">{fromCurrency}/{code}</div>
                  <div className="compare-name">{name}</div>
                </div>
              </div>
              <div className="compare-rate">
                {converted.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <div className="compare-actions">
                <button
                  type="button"
                  className={`pin-button ${isFavorite(code) ? 'pinned' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(fromCurrency, code);
                  }}
                >
                  <img src={isFavorite(code) ? iconStarFilled : iconStar} alt="" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Compare;
