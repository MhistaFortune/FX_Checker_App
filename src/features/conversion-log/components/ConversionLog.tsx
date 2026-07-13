import { getFlagUrl } from '../../../utils/flags';

interface ConversionLogEntry {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  amount: number;
  result: number;
}

interface ConversionLogProps {
  log: ConversionLogEntry[];
  onClearLog: () => void;
  onDeleteEntry: (id: string) => void;
}

export function ConversionLog({
  log,
  onClearLog,
  onDeleteEntry
}: ConversionLogProps) {
  const exportToCSV = () => {
    if (log.length === 0) return;

    const headers = ['Date', 'From Currency', 'To Currency', 'Amount', 'Result'];
    const csvContent = [
      headers.join(','),
      ...log.map(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        return [
          date,
          entry.from,
          entry.to,
          entry.amount.toFixed(2),
          entry.result.toFixed(2)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `fx-conversions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (log.length === 0) {
    return (
      <div className="log-empty">
        <p>Your conversion history will appear here. Log a conversion from the converter above!</p>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div>
      <div className="log-header">
        <button type="button" className="export-log-button" onClick={exportToCSV}>
          Export CSV
        </button>
        <button type="button" className="clear-log-button" onClick={onClearLog}>
          Clear Log
        </button>
      </div>
      <div className="log-list">
        {log.slice().reverse().map(entry => (
          <div key={entry.id} className="log-item">
            <div className="log-info">
              <div className="log-flags">
                <img
                  src={getFlagUrl(entry.from)}
                  alt={entry.from}
                  className="log-flag"
                />
                <img
                  src={getFlagUrl(entry.to)}
                  alt={entry.to}
                  className="log-flag second"
                />
              </div>
              <div className="log-details">
                <div className="log-pair">{entry.from}/{entry.to}</div>
                <div className="log-time">{formatTime(entry.timestamp)}</div>
              </div>
            </div>
            <div className="log-values">
              <div className="log-from">
                {entry.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} {entry.from}
              </div>
              <div className="log-to">
                {entry.result.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} {entry.to}
              </div>
            </div>
            <button
              type="button"
              className="delete-log-button"
              onClick={() => onDeleteEntry(entry.id)}
              aria-label={`Delete conversion from ${entry.from} to ${entry.to}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConversionLog;
