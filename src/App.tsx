import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router';
import { theme } from './theme';
import { queryClient } from './query/queryClient';

export function App() {
  return (
    <ChakraProvider value={theme}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </ChakraProvider>
  );
}
