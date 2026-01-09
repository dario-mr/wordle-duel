import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'wds.theme';

function normalizeTheme(value: string | null): ThemeMode | null {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'light' || normalized === 'dark') {
    return normalized;
  }
  return null;
}

function getPreferredTheme(): ThemeMode {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function readInitialTheme(): ThemeMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return normalizeTheme(value) ?? getPreferredTheme();
  } catch {
    return getPreferredTheme();
  }
}

function persistTheme(theme: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readInitialTheme(),
  setTheme: (theme) => {
    persistTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    persistTheme(next);
    set({ theme: next });
  },
}));
