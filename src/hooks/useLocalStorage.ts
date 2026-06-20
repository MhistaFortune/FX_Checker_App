import { useState, useEffect } from 'react';

/**
 * A custom React hook that wraps useState to synchronize state values
 * automatically with browser localStorage.
 * 
 * @param key The key to use in localStorage.
 * @param initialValue The default value if no key is present in localStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Retrieve initial state from localStorage, fallback to initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync state changes back to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
export default useLocalStorage;
