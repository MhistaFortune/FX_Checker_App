import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface TabsProps {
  children: ReactNode;
  defaultTab?: number;
}

interface TabProps {
  label: string;
  children: ReactNode;
}

export function Tabs({ children, defaultTab = 0 }: TabsProps) {
  const [activeTab, setActiveTab] = useState<number>(() => {
    try {
      const saved = window.localStorage.getItem('fx-checker-active-tab');
      return saved !== null ? parseInt(saved, 10) : defaultTab;
    } catch {
      return defaultTab;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('fx-checker-active-tab', activeTab.toString());
    } catch (e) {
      console.warn('Failed to save active tab to localStorage:', e);
    }
  }, [activeTab]);

  const tabs = Array.isArray(children) ? children : [children];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      const newIndex = (index + direction + tabs.length) % tabs.length;
      setActiveTab(newIndex);
      // Focus the new tab button
      const buttons = document.querySelectorAll('.tab-button');
      (buttons[newIndex] as HTMLButtonElement)?.focus();
    }
  };

  return (
    <div className="tabs-container" role="tablist">
      <div className="tabs-header">
        {tabs.map((tab, index) => (
          <button
            type="button"
            key={index}
            id={`tab-${index}`}
            className={`tab-button ${index === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="tab"
            aria-selected={index === activeTab}
            aria-controls={`panel-${index}`}
            tabIndex={index === activeTab ? 0 : -1}
          >
            {(tab as any)?.props?.label || `Tab ${index + 1}`}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs.map((tab, index) => (
          <div
            key={index}
            id={`panel-${index}`}
            role="tabpanel"
            aria-labelledby={`tab-${index}`}
            hidden={index !== activeTab}
          >
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}
