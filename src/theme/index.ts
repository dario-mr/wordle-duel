import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        dracula: {
          background: { value: '#282a36' },
          currentLine: { value: '#44475a' },
          foreground: { value: '#f8f8f2' },
          comment: { value: '#6272a4' },
          cyan: { value: '#8be9fd' },
          green: { value: '#50fa7b' },
          orange: { value: '#ffb86c' },
          pink: { value: '#ff79c6' },
          purple: { value: '#bd93f9' },
          red: { value: '#ff5555' },
          yellow: { value: '#f1fa8c' },
          card: { value: '#1A1D24' },
          primary: { value: '#078f84' },
          accent: { value: '#1f8df8' },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: { _light: '{colors.white}', _dark: '{colors.dracula.background}' },
          },
          subtle: {
            value: { _light: '{colors.gray.50}', _dark: '{colors.dracula.currentLine}' },
          },
          muted: {
            value: { _light: '{colors.gray.100}', _dark: '{colors.dracula.currentLine}' },
          },
          emphasized: {
            value: { _light: '{colors.gray.200}', _dark: '{colors.dracula.currentLine}' },
          },
          panel: {
            value: { _light: '{colors.white}', _dark: '{colors.dracula.background}' },
          },
          inverted: {
            value: { _light: '{colors.black}', _dark: '{colors.dracula.foreground}' },
          },
          error: {
            value: { _light: '{colors.red.50}', _dark: '{colors.dracula.background}' },
          },
          warning: {
            value: { _light: '{colors.orange.50}', _dark: '{colors.dracula.background}' },
          },
          success: {
            value: { _light: '{colors.green.50}', _dark: '{colors.dracula.background}' },
          },
          info: {
            value: { _light: '{colors.blue.50}', _dark: '{colors.dracula.background}' },
          },
          card: {
            value: { _light: '{colors.green.50}', _dark: '{colors.dracula.card}' },
          },
        },
        fg: {
          DEFAULT: {
            value: { _light: '{colors.black}', _dark: '{colors.dracula.foreground}' },
          },
          muted: {
            value: { _light: '{colors.gray.600}', _dark: '{colors.dracula.comment}' },
          },
          subtle: {
            value: { _light: '{colors.gray.400}', _dark: '{colors.dracula.comment}' },
          },
          inverted: {
            value: { _light: '{colors.gray.50}', _dark: '{colors.dracula.background}' },
          },
          error: {
            value: { _light: '{colors.red.500}', _dark: '{colors.dracula.red}' },
          },
          warning: {
            value: { _light: '{colors.orange.600}', _dark: '{colors.dracula.orange}' },
          },
          success: {
            value: { _light: '{colors.green.600}', _dark: '{colors.dracula.green}' },
          },
          info: {
            value: { _light: '{colors.blue.600}', _dark: '{colors.dracula.cyan}' },
          },
          primary: {
            value: { _light: '{colors.teal.400}', _dark: '{colors.dracula.primary}' },
          },
          accent: {
            value: { _light: '{colors.blue.400}', _dark: '{colors.dracula.accent}' },
          },
        },
        border: {
          DEFAULT: {
            value: { _light: '{colors.gray.200}', _dark: '{colors.dracula.currentLine}' },
          },
          muted: {
            value: { _light: '{colors.gray.100}', _dark: '{colors.dracula.currentLine}' },
          },
          subtle: {
            value: { _light: '{colors.gray.50}', _dark: '{colors.dracula.background}' },
          },
          emphasized: {
            value: { _light: '{colors.gray.300}', _dark: '{colors.dracula.comment}' },
          },
          inverted: {
            value: { _light: '{colors.gray.800}', _dark: '{colors.dracula.foreground}' },
          },
          error: {
            value: { _light: '{colors.red.500}', _dark: '{colors.dracula.red}' },
          },
          warning: {
            value: { _light: '{colors.orange.500}', _dark: '{colors.dracula.orange}' },
          },
          success: {
            value: { _light: '{colors.green.500}', _dark: '{colors.dracula.green}' },
          },
          info: {
            value: { _light: '{colors.blue.500}', _dark: '{colors.dracula.cyan}' },
          },
        },
      },
    },
  },
});

export const theme = createSystem(defaultConfig, config);
