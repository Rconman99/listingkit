import { HistoryEntry } from './types';

export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  getItem: (name: string): string | null => {
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem: (name: string, value: string): void => {
    try { localStorage.setItem(name, value); } catch { /* silent fail */ }
  },
  removeItem: (name: string): void => {
    try { localStorage.removeItem(name); } catch { /* silent fail */ }
  },
};

const HISTORY_KEY = 'listingkit-history';
const MAX_HISTORY = 50;

export function getHistory(): HistoryEntry[] {
  const raw = safeStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function addToHistory(entry: HistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  safeStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter(e => e.id !== id);
  safeStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  safeStorage.removeItem(HISTORY_KEY);
}
