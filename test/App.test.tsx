import { render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/App';

const mocks = vi.hoisted(() => ({
  changeLanguage: vi.fn().mockResolvedValue(undefined),
  refreshAccessToken: vi.fn().mockResolvedValue(null),
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

vi.mock('../src/i18n', () => ({
  i18n: {
    changeLanguage: mocks.changeLanguage,
  },
}));

vi.mock('../src/auth/tokenManager', () => ({
  refreshAccessToken: mocks.refreshAccessToken,
}));

vi.mock('../src/components/common/toaster', () => ({
  Toaster: () => <div>toaster</div>,
}));

vi.mock('../src/router', () => ({
  AppRouter: () => <div>router</div>,
}));

vi.mock('../src/state/localeStore', () => ({
  useLocaleStore: (selector: (state: { locale: string }) => unknown) =>
    selector({ locale: mocks.locale }),
}));

vi.mock('../src/state/themeStore', () => ({
  useThemeStore: (selector: (state: { theme: string }) => unknown) =>
    selector({ theme: mocks.theme }),
}));

vi.mock('../src/query/queryClient', () => ({
  queryClient: {},
}));

vi.mock('../src/theme', () => ({
  theme: {},
}));

describe('App', () => {
  beforeEach(() => {
    mocks.changeLanguage.mockReset();
    mocks.changeLanguage.mockResolvedValue(undefined);
    mocks.refreshAccessToken.mockReset();
    mocks.refreshAccessToken.mockResolvedValue(null);
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

  it('changes language on locale updates and refreshes auth on mount', async () => {
    mocks.locale = 'it';

    const { rerender } = render(<App />);

    await waitFor(() => {
      expect(mocks.changeLanguage).toHaveBeenCalledWith('it');
      expect(mocks.refreshAccessToken).toHaveBeenCalledTimes(1);
    });

    mocks.locale = 'en';
    rerender(<App />);

    await waitFor(() => {
      expect(mocks.changeLanguage).toHaveBeenLastCalledWith('en');
    });
  });
});
