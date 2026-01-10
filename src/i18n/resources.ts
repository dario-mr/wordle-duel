import en from './en';
import it from './it';

export type UiLocale = 'en' | 'it';

export const resources = {
  en: { translation: en },
  it: { translation: it },
} as const;
