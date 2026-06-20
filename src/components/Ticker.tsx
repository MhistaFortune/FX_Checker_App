import { useEffect, useState } from 'react';
import { fetchLatestRates } from '../services/api';
import type { TickerItem } from '../types';

const TICKER_PAIRS = [
  ['USD', 'JPY'],
  ['GBP', 'USD'],
  ['USD', 'CHF'],
  ['EUR', 'GBP'],
  ['AUD', 'USD'],
  ['USD', 'CAD'],
];

export function Ticker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTicker = async () => {
      setLoading(true);
      try {
        const allItems: TickerItem[] = [];

        for (const [from, to] of TICKER_PAIRS) {
          try {
            const data = await fetchLatestRates(from);
            const rate = data.rates?.[to];
            if (rate) {
              allItems.push({
                from,
                to,
                rate,
                change24h: (Math.random() - 0.5) * 2, // Mock change
              });
            }
          } catch (err) {
            // Skip if rate fetch fails for this pair
            continue;
          }
        }

        setItems(allItems);
      } catch (error) {
        console.error('Failed to load ticker:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTicker();
    // Refresh every 30 seconds
    const interval = setInterval(loadTicker, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ticker">
      <div className="ticker-label">● LIVE MARKETS</div>
      <div className="ticker-items">
        {loading && items.length === 0 ? (
          <div className="ticker-item">Loading...</div>
        ) : (
          items.map((item) => (
            <div key={`${item.from}-${item.to}`} className="ticker-item">
              <span className="ticker-pair">{item.from}/{item.to}</span>
              <span className="ticker-rate">{item.rate.toFixed(4)}</span>
              <span className={`ticker-change ${item.change24h >= 0 ? 'up' : 'down'}`}>
                {item.change24h >= 0 ? '▲' : '▼'} {Math.abs(item.change24h).toFixed(2)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
