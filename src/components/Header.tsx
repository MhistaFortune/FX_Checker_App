import logo from '../assets/images/logo.svg';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currencyCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Header({ currencyCount, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <img src={logo} className="logo" alt="FX Checker" />
      </div>
      <div className="header-meta" style={{ gap: '1.25rem' }}>
        <span className="meta-text">
          {currencyCount > 0 ? currencyCount : '--'} Currencies &middot; EOD &middot; ECB data
        </span>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}

export default Header;
