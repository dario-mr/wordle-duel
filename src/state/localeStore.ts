import { create } from 'zustand';
import { getPreferredUiLocale, normalizeUiLocale } from '../i18n';
import type { UiLocale } from '../i18n/resources';
import { STORAGE_KEYS } from './storageKeys';

interface LocaleState {
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: readInitialLocale(),
  setLocale: (locale) => {
    persistLocale(locale);
    set({ locale });
  },
}));

function readInitialLocale(): UiLocale {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.locale);
    const normalized = normalizeUiLocale(stored);
    if (stored) {
      return normalized;
    }
  } catch {
    // ignore
  }

  return getPreferredUiLocale();
}

function persistLocale(locale: UiLocale) {
  try {
    localStorage.setItem(STORAGE_KEYS.locale, locale);
  } catch {
    // ignore
  }
}
