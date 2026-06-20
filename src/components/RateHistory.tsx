import { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchRateHistory } from '../services/api';
import type { HistoricalRatesResponse } from '../types';

interface RateHistoryProps {
  fromCurrency: string;
  toCurrency: string;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

interface ChartDataPoint {
  date: string;
  rate: number;
}

export function RateHistory({ fromCurrency, toCurrency }: RateHistoryProps) {
  const [range, setRange] = useState<TimeRange>('1M');
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    open: 0,
    last: 0,
    change: 0,
    changePercent: 0,
  });

  useEffect(() => {
    if (!fromCurrency || !toCurrency) return;

    setLoading(true);
    setError(null);

    const getDates = (range: TimeRange) => {
      const end = new Date();
      const start = new Date();

      const rangeMap: Record<TimeRange, number> = {
        '1D': 1,
        '1W': 7,
        '1M': 30,
        '3M': 90,
        '1Y': 365,
        '5Y': 365 * 5,
      };

      start.setDate(start.getDate() - rangeMap[range]);

      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      return { start: formatDate(start), end: formatDate(end) };
    };

    const { start, end } = getDates(range);

    fetchRateHistory(fromCurrency, toCurrency, start, end)
      .then((response: HistoricalRatesResponse) => {
        const chartData: ChartDataPoint[] = Object.entries(response.rates)
          .map(([date, rates]) => ({
            date,
            rate: rates[toCurrency] || 0,
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setData(chartData);

        if (chartData.length > 0) {
          const firstRate = chartData[0].rate;
          const lastRate = chartData[chartData.length - 1].rate;
          const change = lastRate - firstRate;
          const changePercent = (change / firstRate) * 100;

          setStats({
            open: firstRate,
            last: lastRate,
            change,
            changePercent,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch rate history:', err);
        setError('Failed to load rate history');
      })
      .finally(() => setLoading(false));
  }, [fromCurrency, toCurrency, range]);

  if (error) {
    return (
      <div className="chart-container">
        <div className="empty-state">
          <div className="empty-state-title">Unable to load chart</div>
          <div className="empty-state-text">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-title">
          {fromCurrency}/{toCurrency}
        </div>
        <div className="chart-ranges">
          {(['1D', '1W', '1M', '3M', '1Y', '5Y'] as TimeRange[]).map((r) => (
            <button
              key={r}
              className={`range-btn ${range === r ? 'active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-stats">
        <div className="stat">
          <div className="stat-label">OPEN</div>
          <div className="stat-value">{stats.open.toFixed(4)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">LAST</div>
          <div className="stat-value">{stats.last.toFixed(4)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">CHANGE</div>
          <div className={`stat-value ${stats.change >= 0 ? 'up' : 'down'}`}>
            {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(4)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">% CHANGE</div>
          <div className={`stat-value ${stats.changePercent >= 0 ? 'up' : 'down'}`}>
            {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
          Loading chart data...
        </div>
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4d417" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#d4d417" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="date"
              stroke="#999"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#999' }}
            />
            <YAxis
              stroke="#999"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#999' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '4px',
              }}
              labelStyle={{ color: '#d4d417' }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#d4d417"
              fillOpacity={1}
              fill="url(#colorRate)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
          No data available
        </div>
      )}
    </div>
  );
}
