// Based on https://usehooks-typescript.com/react-hook/use-read-local-storage
import { useEffect, useState } from 'react';

type Value<T> = string | null;

function useReadLocalStorage(key: string): Value<string> {
  // Get from local storage then
  // parse stored data or return initialValue
  const readValue = (): Value<string> => {
    // Prevent build error "window is undefined" but keep keep working
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ?? null;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return null;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<Value<string>>(readValue);

  // Listen if localStorage changes
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // this only works for other documents, not the current one
    window.addEventListener('storage', handleStorageChange);

    // this is a custom event, triggered in writeValueToLocalStorage
    // See: useLocalStorage()
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return storedValue;
}

export default useReadLocalStorage;
