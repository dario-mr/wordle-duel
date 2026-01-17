import { Box, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { AccentButton, PrimaryButton } from '../../common/BrandButton';
import type { JwtUser } from '../../../auth/jwtUser.ts';

interface Props {
  me: JwtUser | null | undefined;
  logoutPending: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export function AuthActions({ me, logoutPending, onLogin, onLogout }: Props) {
  const { t } = useTranslation();
  const isAuthenticated = Boolean(me);

  return (
    <Box w="full" mt={5}>
      <Stack direction={{ base: 'column', sm: 'row' }} gap={2} w="full">
        {!isAuthenticated && (
          <PrimaryButton onClick={onLogin}>{t('profile.loginWithGoogle')}</PrimaryButton>
        )}

        {isAuthenticated && (
          <AccentButton loading={logoutPending} disabled={logoutPending} onClick={onLogout}>
            {t('profile.logout')}
          </AccentButton>
        )}
      </Stack>
    </Box>
  );
}
