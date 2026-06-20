import { useEffect, useState } from 'react';
import { fetchLatestRates } from '../services/api';
import type { PinnedPair } from '../types';

interface CompareProps {
  fromCurrency: string;
  sendAmount: string;
  pinnedPairs: PinnedPair[];
  onPin: (from: string, to: string, pinned: boolean) => void;
  onLoadPair: (from: string, to: string) => void;
}

interface ComparisonRow {
  to: string;
  amount: number;
  rate: number;
  isPinned: boolean;
}

const COMPARE_CURRENCIES = ['GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'INR', 'CNY', 'BDT'];

export function Compare({ fromCurrency, sendAmount, pinnedPairs, onPin, onLoadPair }: CompareProps) {
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fromCurrency || !sendAmount) {
      setRows([]);
      return;
    }

    setLoading(true);
    fetchLatestRates(fromCurrency, COMPARE_CURRENCIES)
      .then((data) => {
        const newRows = COMPARE_CURRENCIES.map((to) => {
          const rate = data.rates[to] || 0;
          const isPinned = pinnedPairs.some((p) => p.from === fromCurrency && p.to === to);
          return {
            to,
            amount: Number(sendAmount) * rate,
            rate,
            isPinned,
          };
        });
        setRows(newRows);
      })
      .catch((error) => {
        console.error('Failed to fetch comparison rates:', error);
      })
      .finally(() => setLoading(false));
  }, [fromCurrency, sendAmount, pinnedPairs]);

  if (!sendAmount) {
    return (
      <div className="tab-content active">
        <div className="empty-state">
          <div className="empty-state-icon">→</div>
          <div className="empty-state-title">Enter an amount</div>
          <div className="empty-state-text">Enter a send amount to see comparisons across currencies</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content active">
      <div style={{ marginBottom: '1rem', color: '#999', fontSize: '0.875rem' }}>
        MULTI-CURRENCY {Number(sendAmount).toLocaleString('en-US')} FROM {fromCurrency}
      </div>

      {loading ? (
        <div style={{ color: '#999', padding: '2rem', textAlign: 'center' }}>Loading rates...</div>
      ) : rows.length > 0 ? (
        <div className="list-container">
          {rows.map((row) => (
            <div key={row.to} className="list-row">
              <div className="list-row-left">
                <div className="list-row-title">
                  {row.to}
                  <span style={{ color: '#999', marginLeft: '0.5rem' }}>
                    {row.to === 'GBP'
                      ? 'British Pound'
                      : row.to === 'JPY'
                      ? 'Japanese Yen'
                      : row.to === 'CHF'
                      ? 'Swiss Franc'
                      : row.to === 'CAD'
                      ? 'Canadian Dollar'
                      : row.to === 'AUD'
                      ? 'Australian Dollar'
                      : row.to === 'INR'
                      ? 'Indian Rupee'
                      : row.to === 'CNY'
                      ? 'Chinese Yuan'
                      : 'Bangladeshi Taka'}
                  </span>
                </div>
              </div>
              <div className="list-row-right">
                <div className="list-row-value">{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="list-row-subtitle">@ {row.rate.toFixed(4)}</div>
              </div>
              <button
                className={`favorite-btn ${row.isPinned ? 'pinned' : ''}`}
                onClick={() => onPin(fromCurrency, row.to, !row.isPinned)}
                title={row.isPinned ? 'Unpin' : 'Pin'}
              >
                ★
              </button>
            </div>
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
