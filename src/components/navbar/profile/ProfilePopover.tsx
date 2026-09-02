import { Avatar, CloseButton, Drawer, Flex, Popover, Portal, Stack, Text } from '@chakra-ui/react';
import { UserRound } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { beginGoogleLogin, logout } from '../../../api/auth';
import { getErrorMessage } from '../../../api/errors';
import { meQueryKey } from '../../../query/meQueries';
import { useSingleToast } from '../../../hooks/useSingleToast';
import { STORAGE_KEYS } from '../../../state/storageKeys';
import { useCurrentUser } from '../../../auth/useCurrentUser';
import { AuthActions } from './AuthActions';
import { ProfileMenuContent } from './ProfileMenuContent';
import { ProfileTriggerButton } from './ProfileTriggerButton';

type ProfileTrigger = ReactNode | ((pictureUrl?: string | null) => ReactNode);

export function ProfilePopover({
  mobile = false,
  trigger,
}: {
  mobile?: boolean;
  trigger?: ProfileTrigger;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { show: showToast } = useSingleToast();

  const [open, setOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const me = useCurrentUser();

  const displayedMe = logoutPending ? null : me;
  const isLoggedIn = Boolean(displayedMe);

  const profileTitle = isLoggedIn ? (me?.fullName ?? t('profile.title')) : t('profile.title');

  const handleOpenChange = (details: { open: boolean }) => {
    setOpen(details.open);

    if (details.open) {
      setLogoutPending(false);
    }
  };

  const handleUsersClick = () => {
    setOpen(false);
    void navigate('/users');
  };

  const handleLegalClick = () => {
    setOpen(false);
    void navigate('/legal');
  };

  const handleLogoutClick = () => {
    if (logoutPending) {
      return;
    }

    setLogoutPending(true);

    const runLogout = async () => {
      try {
        setOpen(false);

        await logout();

        await queryClient.cancelQueries({ queryKey: ['room'], exact: false });
        queryClient.removeQueries({ queryKey: ['room'], exact: false });

        await queryClient.cancelQueries({ queryKey: meQueryKey(), exact: true });
        queryClient.setQueryData(meQueryKey(), null);
        queryClient.removeQueries({ queryKey: meQueryKey(), exact: true });

        sessionStorage.removeItem(STORAGE_KEYS.authReturnTo);

        void navigate('/', { replace: true });
      } catch (err: unknown) {
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

  const profileTrigger = (typeof trigger === 'function'
    ? trigger(displayedMe?.pictureUrl)
    : trigger) ?? (
    <ProfileTriggerButton
      pictureUrl={isLoggedIn ? me?.pictureUrl : undefined}
      aria-label={t('profile.title')}
    />
  );

  const profileHeader = (
    <Stack gap={3} w="full">
      <Flex align="center" gap={3}>
        <Avatar.Root size="lg" colorPalette="teal">
          {displayedMe?.pictureUrl && <Avatar.Image src={displayedMe.pictureUrl} alt="" />}
          <Avatar.Fallback>
            <UserRound size={24} aria-hidden="true" />
          </Avatar.Fallback>
        </Avatar.Root>
        <Text fontSize="lg" fontWeight="semibold">
          {profileTitle}
        </Text>
      </Flex>
      {!isLoggedIn && (
        <AuthActions
          me={displayedMe}
          logoutPending={logoutPending}
          onLogin={beginGoogleLogin}
          onLogout={handleLogoutClick}
        />
      )}
    </Stack>
  );

  const profileContent = (
    <ProfileMenuContent
      me={displayedMe}
      logoutPending={logoutPending}
      onUsersClick={handleUsersClick}
      onLegalClick={handleLegalClick}
      onLogoutClick={handleLogoutClick}
    />
  );

  if (mobile) {
    return (
      <Drawer.Root open={open} onOpenChange={handleOpenChange} placement="bottom" size="sm">
        <Drawer.Trigger asChild>{profileTrigger}</Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content borderTopRadius="3xl">
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" aria-label={t('common.close')} />
              </Drawer.CloseTrigger>
              <Drawer.Header>
                <Drawer.Title asChild>{profileHeader}</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body pb={0}>{profileContent}</Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    );
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={handleOpenChange}
      positioning={{ placement: 'bottom-end' }}
    >
      <Popover.Trigger asChild>{profileTrigger}</Popover.Trigger>

      <Popover.Positioner>
        <Popover.Content w="20rem" maxW="calc(100vw - 2rem)" p={0} borderRadius="3xl">
          <Popover.CloseTrigger />
          <Popover.Header p={4} pb={0}>
            <Popover.Title asChild>{profileHeader}</Popover.Title>
          </Popover.Header>

          <Popover.Body p={4} pt={3} pb={2}>
            {profileContent}
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
