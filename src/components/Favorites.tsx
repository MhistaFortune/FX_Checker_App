import { useEffect, useState } from 'react';
import { fetchLatestRates } from '../services/api';
import type { PinnedPair } from '../types';

interface FavoritesProps {
  pinnedPairs: PinnedPair[];
  onUnpin: (from: string, to: string) => void;
  onLoadPair: (from: string, to: string) => void;
}

interface FavoriteRow {
  from: string;
  to: string;
  rate: number;
  change24h: number;
}

export function Favorites({ pinnedPairs, onUnpin, onLoadPair }: FavoritesProps) {
  const [rows, setRows] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pinnedPairs.length === 0) {
      setRows([]);
      return;
    }

    setLoading(true);
    const uniqueBases = [...new Set(pinnedPairs.map((p) => p.from))];

    Promise.all(
      uniqueBases.map((base) =>
        fetchLatestRates(base).then((data) => ({
          base,
          rates: data.rates,
        }))
      )
    )
      .then((results) => {
        const newRows: FavoriteRow[] = pinnedPairs.map((pair) => {
          const result = results.find((r) => r.base === pair.from);
          const rate = result?.rates[pair.to] || 0;
          return {
            from: pair.from,
            to: pair.to,
            rate,
            change24h: (Math.random() - 0.5) * 2, // Mock change
          };
        });
        setRows(newRows);
      })
      .catch((error) => {
        console.error('Failed to fetch favorite rates:', error);
      })
      .finally(() => setLoading(false));
  }, [pinnedPairs]);

  if (pinnedPairs.length === 0) {
    return (
      <div className="tab-content active">
        <div className="empty-state">
          <div className="empty-state-icon">★</div>
          <div className="empty-state-title">No favorites yet</div>
          <div className="empty-state-text">Pin a currency pair from the Compare tab to add it here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content active">
      <div style={{ marginBottom: '1rem', color: '#999', fontSize: '0.875rem' }}>
        PINNED PAIRS {pinnedPairs.length > 0 && `• ${pinnedPairs.length} FAVORITES`}
      </div>

      {loading ? (
        <div style={{ color: '#999', padding: '2rem', textAlign: 'center' }}>Loading rates...</div>
      ) : rows.length > 0 ? (
        <div className="list-container">
          {rows.map((row) => (
            <button
              key={`${row.from}-${row.to}`}
              className="list-row"
              style={{ cursor: 'pointer' }}
              onClick={() => onLoadPair(row.from, row.to)}
            >
              <div className="list-row-left">
                <div className="list-row-title">
                  {row.from} → {row.to}
                </div>
              </div>
              <div className="list-row-right">
                <div className="list-row-value">{row.rate.toFixed(4)}</div>
                <div className={`list-row-change ${row.change24h >= 0 ? 'up' : 'down'}`}>
                  {row.change24h >= 0 ? '▲' : '▼'} {Math.abs(row.change24h).toFixed(2)}%
                </div>
              </div>
              <button
                className="favorite-btn pinned"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnpin(row.from, row.to);
                }}
                title="Unpin"
              >
                ★
              </button>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-text">No data available</div>
        </div>
      )}
    </div>
  );
}
