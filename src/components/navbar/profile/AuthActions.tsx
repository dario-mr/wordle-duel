import { Box, Separator, Stack, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { AccentButton, GoogleLoginButton } from '../../common/BrandButton';
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
    <Box w="full">
      <Stack direction={{ base: 'column', sm: 'row' }} w="full" align="center" justify="center">
        {!isAuthenticated && <GoogleLoginButton onClick={onLogin} />}

        {isAuthenticated && (
          <VStack w="full">
            <Separator w="full" mb={3} />
            <AccentButton loading={logoutPending} disabled={logoutPending} onClick={onLogout}>
              {t('profile.logout')}
            </AccentButton>
          </VStack>
        )}
      </Stack>
    </Box>
  );
}
