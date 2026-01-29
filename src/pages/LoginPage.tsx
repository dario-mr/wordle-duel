import { Heading, Link, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { beginGoogleLogin, getCurrentUser, subscribeCurrentUser } from '../api/auth';
import { GoogleLoginButton } from '../components/common/BrandButton';
import { STORAGE_KEYS } from '../state/storageKeys';
import { sanitizeReturnTo } from '../utils/sanitizeReturnTo';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [me, setMe] = useState(() => getCurrentUser());

  useEffect(() => {
    return subscribeCurrentUser(() => {
      setMe(getCurrentUser());
    });
  }, []);

  const returnToParam = params.get('returnTo');

  useEffect(() => {
    if (me) {
      void navigate('/', { replace: true });
    }
  }, [me, navigate]);

  useEffect(() => {
    const sanitizedReturnTo = sanitizeReturnTo(returnToParam);
    if (sanitizedReturnTo) {
      sessionStorage.setItem(STORAGE_KEYS.authReturnTo, sanitizedReturnTo);
    }
  }, [returnToParam]);

  if (me) {
    return null;
  }

  return (
    <Stack gap={3} align="center" justify="center" textAlign="center" minH="50vh">
      <Heading size="lg">{t('login.title')}</Heading>

      <Stack direction={{ base: 'column', sm: 'row' }} gap={2} pt={2}>
        <GoogleLoginButton
          onClick={() => {
            const stored = sessionStorage.getItem(STORAGE_KEYS.authReturnTo);
            const effectiveReturnTo = sanitizeReturnTo(returnToParam ?? stored);

            if (effectiveReturnTo) {
              sessionStorage.setItem(STORAGE_KEYS.authReturnTo, effectiveReturnTo);
            } else {
              sessionStorage.removeItem(STORAGE_KEYS.authReturnTo);
            }

            beginGoogleLogin();
          }}
        />
      </Stack>

      <Text fontSize="sm" opacity={0.75} pt={5}>
        <Trans
          i18nKey="login.disclaimer"
          components={[
            <Link
              key="terms"
              href={appHref('/terms')}
              textDecoration="underline"
              onClick={(e) => {
                e.preventDefault();
                void navigate('/terms');
              }}
            />,
            <Link
              key="privacy"
              href={appHref('/privacy')}
              textDecoration="underline"
              onClick={(e) => {
                e.preventDefault();
                void navigate('/privacy');
              }}
            />,
            <Link
              key="cookies"
              href={appHref('/cookies')}
              textDecoration="underline"
              onClick={(e) => {
                e.preventDefault();
                void navigate('/cookies');
              }}
            />,
          ]}
        />
      </Text>
    </Stack>
  );
}

function appHref(path: string): string {
  const base = import.meta.env.BASE_URL;
  const basePath = base === '/' ? '' : base.replace(/\/$/, '');
  return `${basePath}${path}`;
}
