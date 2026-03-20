import type { ReactNode } from 'react';

export const initReactI18next = {
  type: '3rdParty',
  init: () => undefined,
};

export function useTranslation() {
  return {
    t: (key: string) => key,
  };
}

export function Trans(props: { components?: ReactNode[] }) {
  return props.components?.[0] ?? null;
}
