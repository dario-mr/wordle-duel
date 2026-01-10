import { Avatar, Box, Button, Code, Dialog, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import UserIcon from '../../assets/icons/user.svg?react';
import { useLocaleStore } from '../../state/localeStore';
import { usePlayerStore } from '../../state/playerStore';
import { type ThemeMode, useThemeStore } from '../../state/themeStore';
import type { UiLocale } from '../../i18n/resources';

export function ProfileDialog() {
  const { t } = useTranslation();

  const playerId = usePlayerStore((s) => s.playerId);
  const ensurePlayerId = usePlayerStore((s) => s.ensurePlayerId);

  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const themeMode = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    if (!playerId) {
      ensurePlayerId();
    }
  }, [ensurePlayerId, playerId]);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="ghost" p={0} minW="auto" aria-label={t('nav.openProfileAria')}>
          <Avatar.Root size="sm" colorPalette="teal">
            <Avatar.Fallback>
              <Box
                boxSize="full"
                p="2px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="gray.600"
                _dark={{ color: 'gray.200' }}
              >
                <UserIcon width="100%" height="100%" />
              </Box>
            </Avatar.Fallback>
          </Avatar.Root>
        </Button>
      </Dialog.Trigger>

      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>{t('profile.title')}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap={4} align="start">
              <Box>
                <Text mb={2}>{t('profile.yourPlayerId')}</Text>
                <Code fontSize="sm">{playerId ?? t('profile.loadingPlayerId')}</Code>
              </Box>

              <Box w="full">
                <Text mb={2}>{t('profile.uiLanguage')}</Text>
                <NativeSelect.Root maxW="200px">
                  <NativeSelect.Field
                    value={locale}
                    onChange={(e) => {
                      setLocale(e.target.value as UiLocale);
                    }}
                    aria-label={t('profile.uiLanguageAria')}
                  >
                    <option value="en">{t('locales.en')}</option>
                    <option value="it">{t('locales.it')}</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>

              <Box w="full">
                <Text mb={2}>{t('common.theme')}</Text>
                <NativeSelect.Root maxW="200px">
                  <NativeSelect.Field
                    value={themeMode}
                    onChange={(e) => {
                      setTheme(e.target.value as ThemeMode);
                    }}
                    aria-label={t('common.theme')}
                  >
                    <option value="light">{t('common.light')}</option>
                    <option value="dark">{t('common.dark')}</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>
            </Stack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
