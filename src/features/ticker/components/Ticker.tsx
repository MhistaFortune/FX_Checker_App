import { useEffect, useRef, useMemo } from 'react';
import { getFlagUrl } from '../../../utils/flags';
import type { TickerItem } from '../../../types';

const TICKER_PAIRS = [
  { from: 'EUR', to: 'USD' },
  { from: 'GBP', to: 'USD' },
  { from: 'USD', to: 'JPY' },
  { from: 'AUD', to: 'USD' },
  { from: 'USD', to: 'CAD' },
  { from: 'USD', to: 'CHF' },
  { from: 'EUR', to: 'GBP' }
];

interface TickerProps {
  eurLatestRates: Record<string, number>;
  eurYesterdayRates: Record<string, number>;
}

export function Ticker({ eurLatestRates, eurYesterdayRates }: TickerProps) {
  console.log('Ticker props:', { eurLatestRates, eurYesterdayRates });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPos = useRef(0);
  const animationRef = useRef<number | null>(null);
  const isPaused = useRef(false);

  const items = useMemo<TickerItem[]>(() => {
    console.log('Calculating ticker items...', { eurLatestRates, eurYesterdayRates });
    
    if (Object.keys(eurLatestRates).length === 0 || Object.keys(eurYesterdayRates).length === 0) {
      console.log('Not enough data for ticker items');
      return [];
    }

    const result = TICKER_PAIRS.map(({ from, to }) => {
      const rateToday = eurLatestRates[to] / eurLatestRates[from];
      const rateYesterday = eurYesterdayRates[to] / eurYesterdayRates[from];
      const change24h = ((rateToday - rateYesterday) / rateYesterday) * 100;

      console.log(`Pair ${from}/${to}:`, { rateToday, rateYesterday, change24h });

      return {
        from,
        to,
        rate: rateToday,
        change24h
      };
    });
    
    console.log('Ticker items result:', result);
    return result;
  }, [eurLatestRates, eurYesterdayRates]);

  const loading = Object.keys(eurLatestRates).length === 0;
  const error = false; // Error is handled in App.tsx

  // Animation effect
  useEffect(() => {
    if (loading || error || items.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    const animate = () => {
      if (!isPaused.current) {
        scrollPos.current += 0.6; // Scroll speed (pixels per frame)
        
        // Reset scroll when reaching half the scroll width (width of first list copy)
        const halfWidth = container.scrollWidth / 2;
        if (scrollPos.current >= halfWidth) {
          scrollPos.current = 0;
        }
        
        container.scrollLeft = scrollPos.current;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loading, error, items]);

  if (loading) {
    return (
      <div className="ticker-container loading">
        <span className="ticker-label">Live markets</span>
        <div className="ticker-shimmer">Loading ticker rates...</div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="ticker-container error">
        <span className="ticker-label">Live markets</span>
        <div className="ticker-error-message">Rates currently unavailable</div>
      </div>
    );
  }

  // Duplicate the list to make scrolling infinite and seamless
  const displayItems = [...items, ...items];

  return (
    <div className="ticker-container">
      <span className="ticker-label">LIVE MARKETS</span>
      <div
        className="ticker-viewport"
        ref={containerRef}
        onMouseEnter={() => { isPaused.current = true; }}
        onMouseLeave={() => { isPaused.current = false; }}
      >
        <div className="ticker-track">
          {displayItems.map((item, idx) => {
            const isPositive = item.change24h >= 0;
            return (
              <div className="ticker-card" key={`${item.from}-${item.to}-${idx}`}>
                <div className="ticker-flags">
                  <img
                    src={getFlagUrl(item.from)}
                    alt={`${item.from} flag`}
                    className="ticker-flag"
                    loading="lazy"
                  />
                  <img
                    src={getFlagUrl(item.to)}
                    alt={`${item.to} flag`}
                    className="ticker-flag second"
                    loading="lazy"
                  />
                </div>
                <div className="ticker-pair">
                  <span className="pair-code">{item.from}/{item.to}</span>
                </div>
                <div className="ticker-value">
                  <span className="value-rate">
                    {item.rate.toLocaleString(undefined, {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4
                    })}
                  </span>
                  <span className={`value-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(item.change24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Ticker;
