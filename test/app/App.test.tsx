import { render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/app/App';

const mocks = vi.hoisted(() => ({
  changeLanguage: vi.fn().mockResolvedValue(undefined),
  locale: 'en',
  theme: 'light',
}));

vi.mock('@chakra-ui/react', () => ({
  ChakraProvider: ({ children }: { children?: ReactNode }) => (
    <div data-testid="chakra-provider">{children}</div>
  ),
}));

vi.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children?: ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  ),
}));

vi.mock('../../src/i18n/index', () => ({
  i18n: {
    changeLanguage: mocks.changeLanguage,
  },
}));

vi.mock('../../src/shared/ui/Toaster', () => ({
  Toaster: () => <div>toaster</div>,
}));

vi.mock('../../src/app/router', () => ({
  AppRouter: () => <div>router</div>,
}));

vi.mock('../../src/state/localeStore', () => ({
  useLocaleStore: (selector: (state: { locale: string }) => unknown) =>
    selector({ locale: mocks.locale }),
}));

vi.mock('../../src/state/themeStore', () => ({
  useThemeStore: (selector: (state: { theme: string }) => unknown) =>
    selector({ theme: mocks.theme }),
}));

vi.mock('../../src/app/queryClient', () => ({
  queryClient: {},
}));

vi.mock('../../src/app/theme', () => ({
  theme: {},
}));

describe('App', () => {
  beforeEach(() => {
    mocks.changeLanguage.mockReset();
    mocks.changeLanguage.mockResolvedValue(undefined);
    mocks.locale = 'en';
    mocks.theme = 'light';
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
  });

  it('applies the selected theme mode to the document root', () => {
    mocks.theme = 'dark';

    render(<App />);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('changes language on locale updates', async () => {
    mocks.locale = 'it';

    const { rerender } = render(<App />);

    await waitFor(() => {
      expect(mocks.changeLanguage).toHaveBeenCalledWith('it');
    });

    mocks.locale = 'en';
    rerender(<App />);

    await waitFor(() => {
      expect(mocks.changeLanguage).toHaveBeenLastCalledWith('en');
    });
  });
});
