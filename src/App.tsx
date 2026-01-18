import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useLayoutEffect } from 'react';
import { i18n } from './i18n';
import { refreshAccessToken } from './auth/tokenManager';
import { Toaster } from './components/common/toaster';
import { queryClient } from './query/queryClient';
import { AppRouter } from './router';
import { useLocaleStore } from './state/localeStore';
import { useThemeStore } from './state/themeStore';
import { theme } from './theme';

export function App() {
  const themeMode = useThemeStore((s) => s.theme);
  const locale = useLocaleStore((s) => s.locale);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', themeMode === 'dark');
    root.style.colorScheme = themeMode;
  }, [themeMode]);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);

  useEffect(() => {
    void refreshAccessToken().catch(() => undefined);
  }, []);

  return (
    <ChakraProvider value={theme}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster />
      </QueryClientProvider>
    </ChakraProvider>
  );
}
