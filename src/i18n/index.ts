import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, type UiLocale } from './resources';

export function normalizeUiLocale(value: string | null | undefined): UiLocale {
  if (!value) {
    return 'en';
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'it') {
    return 'it';
  }
  return 'en';
}

export function getPreferredUiLocale(): UiLocale {
  try {
    return normalizeUiLocale(navigator.language);
  } catch {
    return 'en';
  }
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getPreferredUiLocale(),
  fallbackLng: 'en',
  initImmediate: false,
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
