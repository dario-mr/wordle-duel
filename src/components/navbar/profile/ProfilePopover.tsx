import { Grid, Popover, Separator, Stack, Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { beginGoogleLogin, getCurrentUser, logout, subscribeCurrentUser } from '../../../api/auth';
import { getErrorMessage } from '../../../api/errors';
import { meQueryKey, useMeQuery } from '../../../query/meQueries';
import { useSingleToast } from '../../../hooks/useSingleToast';
import type { UiLocale } from '../../../i18n/resources';
import { useLocaleStore } from '../../../state/localeStore';
import { STORAGE_KEYS } from '../../../state/storageKeys';
import { type ThemeMode, useThemeStore } from '../../../state/themeStore';
import { AuthActions } from './AuthActions';
import { LanguageSelect } from './LanguageSelect';
import { ProfileTriggerButton } from './ProfileTriggerButton';
import { ThemeSelect } from './ThemeSelect';
import { PrimaryButton } from '../../common/BrandButton.tsx';

export function ProfilePopover() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { show: showToast } = useSingleToast();

  const [open, setOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const [me, setMe] = useState(() => getCurrentUser());

  useEffect(() => {
    return subscribeCurrentUser(() => {
      setMe(getCurrentUser());
    });
  }, []);

  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const themeMode = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const isLoggedIn = Boolean(me) && !logoutPending;
  const { data: meProfile } = useMeQuery({ enabled: isLoggedIn });

  const profileTitle = isLoggedIn
    ? (meProfile?.fullName ?? t('profile.title'))
    : t('profile.title');

  const handleOpenChange = (details: { open: boolean }) => {
    setOpen(details.open);

    if (details.open) {
      setLogoutPending(false);
    }
  };

  const handleLocaleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as UiLocale);
  };

  const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as ThemeMode);
  };

  const handleLogoutClick = () => {
    if (logoutPending) {
      return;
    }

    setLogoutPending(true);
    setMe(null);

    const runLogout = async () => {
      try {
        setOpen(false);

        await queryClient.cancelQueries({ queryKey: ['room'], exact: false });
        queryClient.removeQueries({ queryKey: ['room'], exact: false });

        await queryClient.cancelQueries({ queryKey: meQueryKey(), exact: true });
        queryClient.removeQueries({ queryKey: meQueryKey(), exact: true });

        sessionStorage.removeItem(STORAGE_KEYS.authReturnTo);

        void navigate('/', { replace: true });

        await logout(); // clears access token + notifies listeners
      } catch (err: unknown) {
        setMe(getCurrentUser());
        showToast({
          type: 'warning',
          title: t('toasts.logoutFailed'),
          description: getErrorMessage(err),
          duration: 2000,
          closable: true,
        });
      } finally {
        setLogoutPending(false);
      }
    };

    void runLogout();
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={handleOpenChange}
      positioning={{ placement: 'bottom-end' }}
    >
      <Popover.Trigger asChild>
        <ProfileTriggerButton pictureUrl={isLoggedIn ? meProfile?.pictureUrl : undefined} />
      </Popover.Trigger>

      <Popover.Positioner>
        <Popover.Content>
          <Popover.CloseTrigger />
          <Popover.Header>
            <Popover.Title fontSize="lg" fontWeight="semibold">
              {profileTitle}
              <Separator mt={3} w="full" />
            </Popover.Title>
          </Popover.Header>

          <Popover.Body>
            <Stack gap={4} align="start">
              <Grid
                w="full"
                templateColumns="auto 1fr"
                alignItems="center"
                columnGap={4}
                rowGap={3}
              >
                <Text>{t('profile.uiLanguage')}</Text>
                <LanguageSelect locale={locale} onChange={handleLocaleChange} />

                <Text>{t('common.theme')}</Text>
                <ThemeSelect themeMode={themeMode} onChange={handleThemeChange} />
              </Grid>

              {isLoggedIn && (
                <PrimaryButton
                  w="full"
                  justifyContent="flex-start"
                  onClick={() => {
                    setOpen(false);
                    void navigate('/my-rooms');
                  }}
                >
                  {t('profile.myRooms')}
                </PrimaryButton>
              )}

              <AuthActions
                me={me}
                logoutPending={logoutPending}
                onLogin={beginGoogleLogin}
                onLogout={handleLogoutClick}
              />
            </Stack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
