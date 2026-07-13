import { getFlagUrl } from '../../../utils/flags';

interface FavoritesProps {
  favorites: Array<{ from: string; to: string }>;
  eurLatestRates: Record<string, number>;
  eurYesterdayRates: Record<string, number>;
  onSelectPair: (from: string, to: string) => void;
  onRemoveFavorite: (from: string, to: string) => void;
}

export function Favorites({
  favorites,
  eurLatestRates,
  eurYesterdayRates,
  onSelectPair,
  onRemoveFavorite
}: FavoritesProps) {
  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <p>You haven't pinned any pairs yet. Star a pair in the converter to pin it here!</p>
      </div>
    );
  }

  const hasRates = Object.keys(eurLatestRates).length > 0;

  return (
    <div className="favorites-list">
      {favorites.map((pair, index) => {
        let rateToday: number | null = null;
        let changePercent: number | null = null;

        if (hasRates && eurLatestRates[pair.from] && eurLatestRates[pair.to]) {
          rateToday = eurLatestRates[pair.to] / eurLatestRates[pair.from];
          if (eurYesterdayRates[pair.from] && eurYesterdayRates[pair.to]) {
            const rateYesterday = eurYesterdayRates[pair.to] / eurYesterdayRates[pair.from];
            changePercent = ((rateToday - rateYesterday) / rateYesterday) * 100;
          }
        }

        const isPositive = changePercent !== null && changePercent >= 0;

        return (
          <div
            key={index}
            className="favorite-item"
            role="button"
            tabIndex={0}
            onClick={() => onSelectPair(pair.from, pair.to)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPair(pair.from, pair.to);
              }
            }}
            aria-label={`Select favorite pair ${pair.from} to ${pair.to}. Current rate is ${rateToday ? rateToday.toFixed(4) : 'unknown'}`}
          >
            <div className="favorite-info">
              <div className="favorite-flags">
                <img
                  src={getFlagUrl(pair.from)}
                  alt={pair.from}
                  className="favorite-flag"
                />
                <img
                  src={getFlagUrl(pair.to)}
                  alt={pair.to}
                  className="favorite-flag second"
                />
              </div>
              <div>
                <div className="favorite-pair">{pair.from}/{pair.to}</div>
                {rateToday !== null && (
                  <div className="favorite-rate">
                    1 {pair.from} = {rateToday.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {pair.to}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {changePercent !== null && (
                <span className={`favorite-change ${isPositive ? 'positive' : 'negative'}`} style={{
                  color: isPositive ? 'var(--success)' : 'var(--error)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  fontWeight: 700
                }}>
                  {isPositive ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                </span>
              )}
              <button
                type="button"
                className="unpin-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFavorite(pair.from, pair.to);
                }}
                aria-label={`Remove ${pair.from} to ${pair.to} from favorites`}
                title={`Remove ${pair.from} to ${pair.to} from favorites`}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Favorites;
