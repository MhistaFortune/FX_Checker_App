import { useState, useEffect } from 'react';
import { fetchRateHistory, isSupportedByFrankfurter } from '../../../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cursor } from 'recharts';

interface RateHistoryProps {
  fromCurrency: string;
  toCurrency: string;
}

const RANGES = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
  { label: '5Y', days: 1825 },
];

export function RateHistory({ fromCurrency, toCurrency }: RateHistoryProps) {
  const [selectedRange, setSelectedRange] = useState(RANGES[1]);
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError(null);

        // Check if both currencies are supported by Frankfurter
        if (!isSupportedByFrankfurter(fromCurrency) || !isSupportedByFrankfurter(toCurrency)) {
          throw new Error(`Historical data is only available for currencies supported by Frankfurter API. ${fromCurrency} or ${toCurrency} is not supported. Try using EUR, USD, GBP, JPY, or other major currencies.`);
        }

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - selectedRange.days);

        const data = await fetchRateHistory(
          fromCurrency,
          toCurrency,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        setHistoryData(data);
      } catch (err) {
        console.error('Failed to load history:', err);
        setError(err instanceof Error ? err.message : 'Could not load rate history');
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [fromCurrency, toCurrency, selectedRange]);

  const chartData = historyData && historyData.rates ? Object.entries(historyData.rates).map(([date, rateMap]: any) => ({
    date,
    rate: rateMap[toCurrency]
  })) : [];

  const stats = historyData && historyData.rates ? (() => {
    const rates = Object.values(historyData.rates).map((r: any) => r[toCurrency]).filter(r => r !== undefined && r !== null);
    
    if (rates.length === 0) return null;
    
    const open = rates[0];
    const close = rates[rates.length - 1];
    const high = Math.max(...rates);
    const low = Math.min(...rates);
    const change = close - open;
    const changePercent = open !== 0 ? (change / open) * 100 : 0;

    return { open, close, high, low, change, changePercent };
  })() : null;

  // Calculate dynamic domain with padding
  const yDomain = (() => {
    if (chartData.length === 0) return [0, 1];
    const rates = chartData.map(d => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const diff = max - min;
    const padding = diff === 0 ? min * 0.1 : diff * 0.1;
    return [Math.max(0, min - padding), max + padding];
  })();

  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(tickItem);
      if (selectedRange.days <= 1) {
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      }
      if (selectedRange.days <= 7) {
        return date.toLocaleDateString(undefined, { weekday: 'short' });
      }
      if (selectedRange.days <= 90) {
        return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      }
      return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    } catch {
      return tickItem;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            {new Date(label).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            1 {fromCurrency} = {payload[0].value.toFixed(4)} {toCurrency}
          </div>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="rate-history">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="rate-history">
      <div className="range-selector" role="group" aria-label="Time range selector">
        {RANGES.map(range => (
          <button
            type="button"
            key={range.label}
            className={`range-button ${selectedRange.label === range.label ? 'active' : ''}`}
            onClick={() => setSelectedRange(range)}
            aria-pressed={selectedRange.label === range.label}
            aria-label={`Show ${range.label} history`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {stats && (
        <div className="history-stats">
          <div className="stat-item">
            <div className="stat-label">OPEN</div>
            <div className="stat-value">{stats.open.toFixed(4)}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">LAST</div>
            <div className="stat-value">{stats.close.toFixed(4)}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">CHANGE</div>
            <div className="stat-value" style={{ color: stats.change >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(4)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">% CHANGE</div>
            <div className="stat-value" style={{ color: stats.changePercent >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      <div className="chart-container" style={{ padding: '1rem', display: 'block', height: '350px', marginTop: '1.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Loading chart...
          </div>
        ) : chartData.length > 0 ? (
          <>
            <div className="chart-pair-label">{fromCurrency}/{toCurrency}</div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a3ff12" stopOpacity="0.6"/>
                    <stop offset="50%" stopColor="#a3ff12" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#a3ff12" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  domain={yDomain}
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                  tickFormatter={(val) => val.toFixed(3)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Cursor stroke="#a3ff12" strokeWidth={1} strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#a3ff12"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#chartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No history data available
          </div>
        )}
      </div>
    </div>
  );
}

export default RateHistory;
