import { Popover, Stack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { beginGoogleLogin, getCurrentUser, logout, subscribeCurrentUser } from '../../../api/auth';
import { getErrorMessage } from '../../../api/errors';
import { useSingleToast } from '../../../hooks/useSingleToast';
import type { UiLocale } from '../../../i18n/resources';
import { useLocaleStore } from '../../../state/localeStore';
import { type ThemeMode, useThemeStore } from '../../../state/themeStore';
import { AuthActions } from './AuthActions';
import { LanguageSelect } from './LanguageSelect';
import { ProfileTriggerButton } from './ProfileTriggerButton';
import { ThemeSelect } from './ThemeSelect';

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

  const profileTitle = me?.name ?? t('profile.title');

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

    const runLogout = async () => {
      try {
        await logout(); // clears token + notifies listeners
        setOpen(false);

        await queryClient.cancelQueries({ queryKey: ['room'] });
        queryClient.removeQueries({ queryKey: ['room'] });

        void navigate('/');
      } catch (err: unknown) {
        showToast({
          type: 'warning',
          title: t('toasts.logoutFailed'),
          description: getErrorMessage(err),
          duration: 3000,
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
        <ProfileTriggerButton />
      </Popover.Trigger>

      <Popover.Positioner>
        <Popover.Content>
          <Popover.CloseTrigger />
          <Popover.Header>
            <Popover.Title fontSize="lg" fontWeight="semibold">
              {profileTitle}
            </Popover.Title>
          </Popover.Header>

          <Popover.Body>
            <Stack gap={4} align="start">
              <LanguageSelect locale={locale} onChange={handleLocaleChange} />
              <ThemeSelect themeMode={themeMode} onChange={handleThemeChange} />
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
