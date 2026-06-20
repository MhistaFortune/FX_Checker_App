import type { ConversionLogEntry } from '../types';

interface ConversionLogProps {
  entries: ConversionLogEntry[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function ConversionLog({ entries, onDelete, onClear }: ConversionLogProps) {
  if (entries.length === 0) {
    return (
      <div className="tab-content active">
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No conversions logged</div>
          <div className="empty-state-text">Conversions will appear here when you log them</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content active">
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#999', fontSize: '0.875rem' }}>
          {entries.length} CONVERSIONS LOGGED
        </div>
        {entries.length > 0 && (
          <button
            className="btn-secondary"
            onClick={onClear}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
          >
            CLEAR LOG
          </button>
        )}
      </div>

      <div className="list-container">
        {entries.map((entry) => (
          <div key={entry.id} className="list-row">
            <div className="list-row-left">
              <div className="list-row-title">
                {entry.from} → {entry.to}
              </div>
              <div className="list-row-subtitle">{getRelativeTime(entry.timestamp)}</div>
            </div>
            <div className="list-row-right">
              <div className="list-row-value">
                {entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {entry.from} = {' '}
                {entry.result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {entry.to}
              </div>
            </div>
            <button
              className="favorite-btn"
              onClick={() => onDelete(entry.id)}
              style={{ color: '#ef4444' }}
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
