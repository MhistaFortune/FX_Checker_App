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
  
  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map((tab, index) => (
          <button
            type="button"
            key={index}
            className={`tab-button ${index === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {(tab as any)?.props?.label || `Tab ${index + 1}`}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs[activeTab]}
      </div>
    </div>
  );
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}
