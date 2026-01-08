import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  // ready for future customization
});

export const theme = createSystem(defaultConfig, config);
