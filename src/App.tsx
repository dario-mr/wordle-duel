import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Toaster } from './components/common/toaster';
import { queryClient } from './query/queryClient';
import { AppRouter } from './router';
import { useThemeStore } from './state/themeStore';
import { theme } from './theme';

export function App() {
  const themeMode = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', themeMode === 'dark');
    root.style.colorScheme = themeMode;
  }, [themeMode]);

  return (
    <ChakraProvider value={theme}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster />
      </QueryClientProvider>
    </ChakraProvider>
  );
}
