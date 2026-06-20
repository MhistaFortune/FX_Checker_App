import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ConversionLogEntry, PinnedPair } from './types';
import { Ticker } from './components/Ticker';
import { Converter } from './components/Converter';
import { RateHistory } from './components/RateHistory';
import { Compare } from './components/Compare';
import { Favorites } from './components/Favorites';
import { ConversionLog } from './components/ConversionLog';
import './App.css';

type TabType = 'history' | 'compare' | 'favorites' | 'log';

function App() {
  const [fromCurrency, setFromCurrency] = useLocalStorage('fxChecker_from', 'USD');
  const [toCurrency, setToCurrency] = useLocalStorage('fxChecker_to', 'EUR');
  const [pinnedPairs, setPinnedPairs] = useLocalStorage<PinnedPair[]>('fxChecker_pinned', []);
  const [conversionLog, setConversionLog] = useLocalStorage<ConversionLogEntry[]>('fxChecker_log', []);
  const [activeTab, setActiveTab] = useLocalStorage<TabType>('fxChecker_tab', 'history');
  const [sendAmount, setSendAmount] = useLocalStorage('fxChecker_sendAmount', '1000');

  const isFavorited = pinnedPairs.some((p) => p.from === fromCurrency && p.to === toCurrency);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleCurrencyChange = (from: string, to: string) => {
    setFromCurrency(from);
    setToCurrency(to);
  };

  const handleFavorite = (from: string, to: string, isFavorited: boolean) => {
    if (isFavorited) {
      setPinnedPairs([...pinnedPairs, { from, to }]);
    } else {
      setPinnedPairs(pinnedPairs.filter((p) => !(p.from === from && p.to === to)));
    }
  };

  const handleUnpin = (from: string, to: string) => {
    setPinnedPairs(pinnedPairs.filter((p) => !(p.from === from && p.to === to)));
  };

  const handlePin = (from: string, to: string, pinned: boolean) => {
    if (pinned) {
      setPinnedPairs([...pinnedPairs, { from, to }]);
    } else {
      handleUnpin(from, to);
    }
  };

  const handleLog = (entry: ConversionLogEntry) => {
    setConversionLog([entry, ...conversionLog]);
  };

  const handleDeleteLog = (id: string) => {
    setConversionLog(conversionLog.filter((entry) => entry.id !== id));
  };

  const handleClearLog = () => {
    setConversionLog([]);
  };

  const handleLoadPair = (from: string, to: string) => {
    setFromCurrency(from);
    setToCurrency(to);
    setActiveTab('history');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span>✓</span>
            <span>FX_CHECKER</span>
          </div>
        </div>
        <div className="header-stats">
          55 CURRENCIES • EOD • ECB DATA
        </div>
      </header>

      {/* Ticker */}
      <Ticker />

      {/* Main Content */}
      <main className="main-content">
        {/* Converter */}
        <Converter
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          onSwap={handleSwap}
          onCurrencyChange={handleCurrencyChange}
          onFavorite={handleFavorite}
          onLog={handleLog}
          isFavorited={isFavorited}
          onSendAmountChange={setSendAmount}
        />

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            HISTORY
          </button>
          <button
            className={`tab ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            COMPARE
          </button>
          <button
            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            FAVORITES
            {pinnedPairs.length > 0 && <span className="tab-badge">{pinnedPairs.length}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'log' ? 'active' : ''}`}
            onClick={() => setActiveTab('log')}
          >
            LOG
            {conversionLog.length > 0 && <span className="tab-badge">{conversionLog.length}</span>}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'history' && <RateHistory fromCurrency={fromCurrency} toCurrency={toCurrency} />}

        {activeTab === 'compare' && (
          <Compare
            fromCurrency={fromCurrency}
            sendAmount={sendAmount}
            pinnedPairs={pinnedPairs}
            onPin={handlePin}
            onLoadPair={handleLoadPair}
          />
        )}

        {activeTab === 'favorites' && (
          <Favorites
            pinnedPairs={pinnedPairs}
            onUnpin={handleUnpin}
            onLoadPair={handleLoadPair}
          />
        )}

        {activeTab === 'log' && (
          <ConversionLog
            entries={conversionLog}
            onDelete={handleDeleteLog}
            onClear={handleClearLog}
          />
        )}
      </main>
    </div>
  );
}

export default App;
